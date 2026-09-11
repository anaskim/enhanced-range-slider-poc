type Theme = "system" | "light" | "dark";

interface PrismApi {
    highlightElement(element: Element): void;
}

declare const Prism: PrismApi;

const themeOrder: Theme[] = ["system", "light", "dark"];
const themeStorageKey = "rangegroup-theme";

function selectorParses(selector: string): boolean {
    const style = document.createElement("style");
    style.textContent = `${selector} { color: rgb(1 2 3); }`;
    document.head.append(style);
    const parsed = style.sheet?.cssRules.length === 1;
    style.remove();
    return parsed;
}

interface NativePrototypeSupport {
    core: boolean;
    convenienceApi: boolean;
    pseudos: boolean;
    segmentDragging: "separate-flag";
}

function detectNativePrototype(): NativePrototypeSupport {
    const group = document.createElement("rangegroup");
    const core = typeof window.HTMLRangeGroupElement === "function" && group instanceof window.HTMLRangeGroupElement;
    const convenienceApi =
        core &&
        ["values", "inputs", "getRangeInput", "setRangeValue", "addThumb", "removeThumb"].every(
            (member) => member in group,
        );
    const pseudos =
        selectorParses("rangegroup::slider-track") &&
        selectorParses("rangegroup::slider-segment") &&
        selectorParses("rangegroup::slider-thumb(*)");

    return { core, convenienceApi, pseudos, segmentDragging: "separate-flag" };
}

function initializeTheme(): void {
    const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]"));
    const html = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const getStoredTheme = (): Theme => {
        try {
            const stored = localStorage.getItem(themeStorageKey);
            return themeOrder.includes(stored as Theme) ? (stored as Theme) : "system";
        } catch {
            return "system";
        }
    };

    const applyTheme = (theme: Theme): void => {
        html.classList.remove("light", "dark");
        html.classList.add(theme === "system" ? (prefersDark.matches ? "dark" : "light") : theme);
        toggles.forEach((toggle) => {
            toggle.dataset.theme = theme;
            toggle.setAttribute("aria-label", `Theme: ${theme}`);
        });
    };

    let activeTheme = getStoredTheme();
    applyTheme(activeTheme);

    prefersDark.addEventListener("change", () => {
        if (activeTheme === "system") {
            applyTheme(activeTheme);
        }
    });

    toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            activeTheme = themeOrder[(themeOrder.indexOf(activeTheme) + 1) % themeOrder.length];
            try {
                if (activeTheme === "system") {
                    localStorage.removeItem(themeStorageKey);
                } else {
                    localStorage.setItem(themeStorageKey, activeTheme);
                }
            } catch {
                // Theme persistence is optional when storage is unavailable.
            }
            applyTheme(activeTheme);
        });
    });
}

function initializePrototypeStatus(): NativePrototypeSupport {
    const support = detectNativePrototype();
    const ready = support.core && support.convenienceApi && support.pseudos;
    const html = document.documentElement;
    html.classList.toggle("prototype-ready", ready);
    html.classList.toggle("prototype-partial", support.core && !ready);
    html.classList.toggle("prototype-fallback", !support.core);
    html.classList.toggle("prototype-pseudos", support.core && support.pseudos);
    html.dataset.rangegroupCore = support.core ? "on" : "off";
    html.dataset.rangegroupApi = support.convenienceApi ? "on" : "off";
    html.dataset.rangegroupPseudos = support.pseudos ? "on" : "off";
    html.dataset.rangegroupSegmentDragging = support.segmentDragging;

    document.querySelectorAll<HTMLElement>("[data-runtime-status]").forEach((status) => {
        status.textContent = !support.core ? "Fallback mode" : ready ? "Prototype ready" : "Partial prototype";
        status.dataset.state = !support.core ? "fallback" : ready ? "ready" : "partial";
        status.title = [
            `Core: ${support.core ? "on" : "off"}`,
            `Convenience API: ${support.convenienceApi ? "on" : "off"}`,
            `Slider pseudos: ${support.pseudos ? "on" : "off"}`,
            "Segment dragging: separate launch flag; not feature-detectable",
        ].join("\n");
    });

    return support;
}

function initializeExampleRuntimes(support: NativePrototypeSupport): void {
    document.querySelectorAll<HTMLTemplateElement>("template[data-example-runtime]").forEach((template) => {
        const requiredCapabilities = (template.dataset.runtimeRequires ?? "core").split(" ") as Array<
            keyof Pick<NativePrototypeSupport, "core" | "convenienceApi" | "pseudos">
        >;
        const enabled = requiredCapabilities.every((capability) => support[capability]);
        const example = template.closest<HTMLElement>(".example");
        if (example) {
            example.dataset.runtimeState = enabled ? "enabled" : "blocked";
            example.dataset.runtimeRequires = requiredCapabilities.join(" ");
        }
        if (!enabled) {
            return;
        }

        template.content.querySelectorAll<HTMLScriptElement>("script").forEach((source) => {
            const script = document.createElement("script");
            for (const attribute of source.attributes) {
                script.setAttribute(attribute.name, attribute.value);
            }
            script.textContent = source.textContent;
            template.before(script);
        });
        template.remove();
    });
}

function initializeMobileMenu(): void {
    const menu = document.querySelector<HTMLElement>("#mobile-header-menu");
    const button = document.querySelector<HTMLButtonElement>(".mobile-menu-button");
    if (!menu || !button || typeof menu.showPopover !== "function") {
        return;
    }

    document.body.classList.add("has-popover-menu");
    const syncExpanded = (): void => {
        button.setAttribute("aria-expanded", menu.matches(":popover-open") ? "true" : "false");
    };
    menu.addEventListener("toggle", syncExpanded);
    syncExpanded();
}

function initializeScrollSpy(): void {
    const desktop = window.matchMedia("(min-width: 961px)");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".sidebar a[href^='#']"));
    let animationFrame = 0;

    const visibleTargets = (): HTMLElement[] =>
        links
            .map((link) => document.querySelector<HTMLElement>(link.hash))
            .filter((target): target is HTMLElement => Boolean(target));

    const clearActive = (): void => {
        links.forEach((link) => link.classList.remove("is-active"));
    };

    const update = (): void => {
        animationFrame = 0;
        if (!desktop.matches) {
            clearActive();
            return;
        }

        const targets = visibleTargets();
        if (!targets.length) {
            return;
        }

        const activationOffset = 92;
        let active = targets[0];
        for (const target of targets) {
            if (target.getBoundingClientRect().top <= activationOffset) {
                active = target;
            } else {
                break;
            }
        }

        clearActive();
        document
            .querySelector<HTMLAnchorElement>(`.sidebar a[href="#${CSS.escape(active.id)}"]`)
            ?.classList.add("is-active");
    };

    const queueUpdate = (): void => {
        if (!animationFrame) {
            animationFrame = window.requestAnimationFrame(update);
        }
    };

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    window.addEventListener("hashchange", queueUpdate);
    desktop.addEventListener("change", queueUpdate);
    queueUpdate();
}

function dedent(text: string): string {
    const lines = text.split("\n");
    while (lines.length && !lines[0].trim()) {
        lines.shift();
    }
    while (lines.length && !lines[lines.length - 1].trim()) {
        lines.pop();
    }
    if (!lines.length) {
        return "";
    }

    const indent = lines
        .filter((line) => line.trim())
        .reduce((minimum, line) => Math.min(minimum, line.match(/^(\s*)/)?.[1].length ?? 0), Infinity);
    return lines.map((line) => line.slice(indent)).join("\n");
}

function highlightPanel(panel: Element): void {
    panel.querySelectorAll<HTMLElement>('code[class*="language-"]:not(.prism-highlighted)').forEach((code) => {
        Prism.highlightElement(code);
        code.classList.add("prism-highlighted");
    });
}

function initializeCodeBlocks(): void {
    document.querySelectorAll<HTMLDetailsElement>(".code-block").forEach((details, blockIndex) => {
        const sources = Array.from(details.querySelectorAll<HTMLScriptElement>('script[type="text/plain"]'));
        if (!sources.length) {
            return;
        }

        const tablist = document.createElement("div");
        tablist.setAttribute("role", "tablist");
        tablist.setAttribute("aria-label", "Code example");
        const panels: HTMLElement[] = [];

        sources.forEach((source, sourceIndex) => {
            const language = source.dataset.lang ?? "text";
            const languageLabel = { html: "HTML", css: "CSS", javascript: "JS" }[language] ?? language;
            const tabId = `cb${blockIndex}-tab-${language}`;
            const panelId = `cb${blockIndex}-panel-${language}`;

            const tab = document.createElement("button");
            tab.type = "button";
            tab.setAttribute("role", "tab");
            tab.id = tabId;
            tab.setAttribute("aria-controls", panelId);
            tab.setAttribute("aria-selected", sourceIndex === 0 ? "true" : "false");
            tab.tabIndex = sourceIndex === 0 ? 0 : -1;
            tab.textContent = languageLabel;
            tablist.append(tab);

            const panel = document.createElement("div");
            panel.setAttribute("role", "tabpanel");
            panel.id = panelId;
            panel.setAttribute("aria-labelledby", tabId);
            panel.hidden = sourceIndex > 0;

            const pre = document.createElement("pre");
            pre.className = `language-${language}`;
            const code = document.createElement("code");
            code.className = `language-${language}`;
            code.textContent = dedent(source.textContent);
            pre.append(code);
            panel.append(pre);
            details.append(panel);
            panels.push(panel);
        });

        sources.forEach((source) => source.remove());
        details.querySelector("summary")?.after(tablist);
        const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

        const selectTab = (selected: HTMLButtonElement): void => {
            tabs.forEach((tab) => {
                tab.setAttribute("aria-selected", "false");
                tab.tabIndex = -1;
            });
            panels.forEach((panel) => {
                panel.hidden = true;
            });

            selected.setAttribute("aria-selected", "true");
            selected.tabIndex = 0;
            const panel = details.querySelector<HTMLElement>(
                `#${CSS.escape(selected.getAttribute("aria-controls") ?? "")}`,
            );
            if (panel) {
                panel.hidden = false;
                highlightPanel(panel);
            }
        };

        tabs.forEach((tab, tabIndex) => {
            tab.addEventListener("click", () => selectTab(tab));
            tab.addEventListener("keydown", (event) => {
                let nextIndex: number;
                switch (event.key) {
                    case "ArrowRight":
                        nextIndex = (tabIndex + 1) % tabs.length;
                        break;
                    case "ArrowLeft":
                        nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
                        break;
                    case "Home":
                        nextIndex = 0;
                        break;
                    case "End":
                        nextIndex = tabs.length - 1;
                        break;
                    default:
                        return;
                }
                event.preventDefault();
                selectTab(tabs[nextIndex]);
                tabs[nextIndex].focus();
            });
        });

        details.addEventListener("toggle", () => {
            const panel = details.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
            if (details.open && panel) {
                highlightPanel(panel);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    const prototypeSupport = initializePrototypeStatus();
    initializeMobileMenu();
    initializeScrollSpy();
    initializeCodeBlocks();
    initializeExampleRuntimes(prototypeSupport);
});
