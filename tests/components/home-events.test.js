import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';

const DAY = 86400000;
const NOW = Date.UTC(2026, 9, 9);

const makeEvent = (id, status) => ({
  id, name: id, description: '', category: 'event', cover: '', color: '#123456',
  sourceUrl: '', start: NOW - DAY, end: NOW + 5 * DAY, lane: 0, status,
  scheduled: true, completed: false, recurrence: null, progress: 20,
  daysLeft: 5, daysUntil: status === 'upcoming' ? 3 : -1, durationDays: 6,
});

// vi.mock factories are hoisted above imports, so shared state has to be hoisted too.
const { ongoing, upcoming, store } = vi.hoisted(() => {
  const { ref: hRef } = require('vue');
  return {
    ongoing: hRef([]),
    upcoming: hRef([]),
    store: () => ({ hydrate: () => {}, currentGameId: 'ww' }),
  };
});

vi.mock('@/composables/useEvents', async () => {
  const { ref: r } = await import('vue');
  return { useEvents: () => ({ endingSoon: ongoing, upcoming, hasEvents: r(true) }) };
});
vi.mock('@/composables/useLocale', async () => {
  const { ref: r } = await import('vue');
  return {
    useLocale: () => ({
      tUI: (k) => k,
      loadGameLocales: () => {},
      currentTranslations: r({}),
      locale: r('en'),
    }),
  };
});
vi.mock('@/store/planner', () => ({ usePlannerStore: store }));
vi.mock('@/store/inventory', () => ({ useInventoryStore: store }));
vi.mock('@/store/game', () => ({ useGameStore: store }));
vi.mock('@/store/userProfile', () => ({ useUserProfileStore: store }));

const mountHome = () => mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } });

/**
 * "View all" used to be a link to /timeline, which left nothing on screen to get
 * back to the short summary. It now expands in place and folds back.
 */
describe('Home events widget — View all', () => {
  it('shows at most 3 cards per group before expanding', () => {
    ongoing.value = Array.from({ length: 5 }, (_, i) => makeEvent(`o${i}`, 'ongoing'));
    upcoming.value = [];
    const wrapper = mountHome();
    expect(wrapper.findAll('.event-card')).toHaveLength(3);
    expect(wrapper.find('.events-more').text()).toBe('home.eventsMore');
  });

  it('expands to every card without leaving the page', async () => {
    ongoing.value = Array.from({ length: 5 }, (_, i) => makeEvent(`o${i}`, 'ongoing'));
    const wrapper = mountHome();
    await wrapper.find('.events-more').trigger('click');

    expect(wrapper.findAll('.event-card')).toHaveLength(5);
    expect(wrapper.find('.events-more').text()).toBe('home.eventsLess');
    expect(wrapper.find('.events-more').attributes('aria-expanded')).toBe('true');
  });

  it('folds back to exactly the state before View all was pressed', async () => {
    ongoing.value = Array.from({ length: 5 }, (_, i) => makeEvent(`o${i}`, 'ongoing'));
    upcoming.value = Array.from({ length: 4 }, (_, i) => makeEvent(`u${i}`, 'upcoming'));
    const wrapper = mountHome();
    const before = wrapper.findAll('.event-card').map((c) => c.text());

    await wrapper.find('.events-more').trigger('click');
    expect(wrapper.findAll('.event-card')).toHaveLength(9);
    await wrapper.find('.events-more').trigger('click');

    expect(wrapper.findAll('.event-card').map((c) => c.text())).toEqual(before);
    expect(wrapper.find('.events-more').text()).toBe('home.eventsMore');
  });

  it('hides View all when folding would hide nothing', () => {
    ongoing.value = [makeEvent('o0', 'ongoing'), makeEvent('o1', 'ongoing')];
    upcoming.value = [makeEvent('u0', 'upcoming')];
    const wrapper = mountHome();
    expect(wrapper.find('.events-more').exists()).toBe(false);
  });

  it('keeps a separate link to the timeline page', () => {
    ongoing.value = [makeEvent('o0', 'ongoing')];
    const wrapper = mountHome();
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/timeline');
  });
});
