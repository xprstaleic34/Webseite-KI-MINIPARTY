const tabs = Array.from(document.querySelectorAll('.tab-button[role="tab"]'));
const panels = Array.from(document.querySelectorAll('.tab-panel[role="tabpanel"]'));
const tabList = document.querySelector('.tab-list[role="tablist"]');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateHash(name) {
  const nextHash = `#${name}`;

  if (window.location.hash !== nextHash) {
    history.replaceState(null, '', nextHash);
  }
}

function scrollToElement(element) {
  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    block: 'start',
  });
}

function activateTab(nextTab, { setFocus = true, syncHash = false } = {}) {
  const currentTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');

  if (!nextTab) {
    return;
  }

  if (currentTab === nextTab) {
    if (setFocus) {
      nextTab.focus();
    }

    if (syncHash) {
      updateHash(nextTab.dataset.tab);
    }

    return;
  }

  tabs.forEach((tab) => {
    const isActive = tab === nextTab;

    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === nextTab.dataset.tab;

    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  if (setFocus) {
    nextTab.focus();
  }

  if (syncHash) {
    updateHash(nextTab.dataset.tab);
  }
}

if (tabList) {
  tabList.addEventListener('click', (event) => {
    const nextTab = event.target.closest('.tab-button[role="tab"]');

    if (!nextTab) {
      return;
    }

    activateTab(nextTab, { syncHash: true });
  });

  tabList.addEventListener('keydown', (event) => {
    const currentIndex = tabs.indexOf(event.target);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activateTab(tabs[currentIndex], { syncHash: true });
        return;
      default:
        return;
    }

    event.preventDefault();
    activateTab(tabs[nextIndex], { syncHash: true });
  });
}

document.querySelectorAll('[data-tab-target]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetName = trigger.dataset.tabTarget;
    const targetTab = tabs.find((tab) => tab.dataset.tab === targetName);

    if (!targetTab) {
      return;
    }

    event.preventDefault();
    activateTab(targetTab, { setFocus: false, syncHash: true });
    scrollToElement(document.querySelector('#tabs'));
  });
});

document.querySelectorAll('[data-scroll-target]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    scrollToElement(document.querySelector(trigger.dataset.scrollTarget));
  });
});

function activateTabFromHash() {
  const hash = window.location.hash.replace('#', '').trim();

  if (!hash) {
    return;
  }

  const targetTab = tabs.find((tab) => tab.dataset.tab === hash);

  if (targetTab) {
    activateTab(targetTab, { setFocus: false });
  }
}

activateTabFromHash();
window.addEventListener('hashchange', activateTabFromHash);
