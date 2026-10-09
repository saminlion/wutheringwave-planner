import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EventList from '@/components/timeline/EventList.vue';
import EventGantt from '@/components/timeline/EventGantt.vue';
import EventCover from '@/components/timeline/EventCover.vue';

const DAY = 86400000;
const NOW = Date.UTC(2026, 7, 9, 12, 0, 0);

/** Mirrors what useEvents() hands the components. */
const makeEvent = (overrides = {}) => ({
  id: overrides.id ?? 'evt-1',
  name: 'Test Event',
  description: 'A description.',
  category: 'event',
  cover: '',
  color: '#18235f',
  sourceUrl: '',
  start: NOW - 2 * DAY,
  end: NOW + 5 * DAY,
  lane: 0,
  status: 'ongoing',
  progress: 28.5,
  daysLeft: 5,
  daysUntil: -2,
  durationDays: 7,
  ...overrides,
});

describe('EventCover', () => {
  it('renders an image when a src is provided', () => {
    const wrapper = mount(EventCover, { props: { src: 'https://example.com/a.png', alt: 'Alpha' } });
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('falls back to a color tile when src is blank', () => {
    const wrapper = mount(EventCover, { props: { src: '', alt: 'Alpha' } });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.cover-initial').text()).toBe('A');
  });

  it('falls back to the color tile when the image fails to load', async () => {
    const wrapper = mount(EventCover, { props: { src: 'https://example.com/broken.png', alt: 'Alpha' } });
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.cover-initial').exists()).toBe(true);
  });
});

describe('EventList', () => {
  it('groups events by status', () => {
    const wrapper = mount(EventList, {
      props: {
        events: [
          makeEvent({ id: 'a', status: 'ongoing' }),
          makeEvent({ id: 'b', status: 'upcoming', daysUntil: 3 }),
          makeEvent({ id: 'c', status: 'ended' }),
        ],
      },
    });
    expect(wrapper.findAll('.event-group')).toHaveLength(3);
    expect(wrapper.findAll('.event-card')).toHaveLength(3);
  });

  it('hides ended events when showEnded is false', () => {
    const wrapper = mount(EventList, {
      props: {
        events: [makeEvent({ id: 'a', status: 'ongoing' }), makeEvent({ id: 'c', status: 'ended' })],
        showEnded: false,
      },
    });
    expect(wrapper.findAll('.event-card')).toHaveLength(1);
  });

  it('caps each group at `limit` and drops descriptions in compact mode', () => {
    const wrapper = mount(EventList, {
      props: {
        events: [
          makeEvent({ id: 'a' }),
          makeEvent({ id: 'b' }),
          makeEvent({ id: 'c' }),
        ],
        compact: true,
        limit: 2,
      },
    });
    expect(wrapper.findAll('.event-card')).toHaveLength(2);
    expect(wrapper.find('.card-desc').exists()).toBe(false);
  });

  it('renders a card as a link only when sourceUrl is set', () => {
    const wrapper = mount(EventList, {
      props: {
        events: [
          makeEvent({ id: 'a', sourceUrl: 'https://example.com' }),
          makeEvent({ id: 'b', sourceUrl: '' }),
        ],
      },
    });
    const cards = wrapper.findAll('.event-card');
    expect(cards[0].element.tagName).toBe('A');
    expect(cards[1].element.tagName).toBe('DIV');
  });

  it('shows a progress bar only for ongoing events', () => {
    const wrapper = mount(EventList, {
      props: { events: [makeEvent({ id: 'a', status: 'upcoming', daysUntil: 3 })] },
    });
    expect(wrapper.find('.progress-track').exists()).toBe(false);
  });
});

describe('EventList View all / View less (timeline page)', () => {
  const ongoing = (id) => makeEvent({ id, status: 'ongoing' });
  const upcomingIn = (id, days) => makeEvent({ id, status: 'upcoming', daysUntil: days });
  const tba = (id) => makeEvent({ id, status: 'tba', start: null, end: null, daysLeft: null, daysUntil: null });
  const ended = (id) => makeEvent({ id, status: 'ended' });

  const events = () => [
    ongoing('o1'), ongoing('o2'), ongoing('o3'), ongoing('o4'),
    upcomingIn('soon', 2), upcomingIn('week', 7), upcomingIn('later', 8), upcomingIn('far', 30),
    tba('t1'),
  ];
  const groupsShown = (wrapper) => wrapper.findAll('.event-group')
    .map((g) => [g.find('.group-title').text().split(' ')[0], g.findAll('.event-card').length]);

  it('View less keeps every ongoing event and upcoming ones within 7 days', () => {
    const wrapper = mount(EventList, { props: { events: events(), collapsible: true } });
    expect(groupsShown(wrapper)).toEqual([['timeline.ongoing', 4], ['timeline.upcoming', 2]]);
  });

  it('counts the 7th day as soon and the 8th as later', () => {
    const wrapper = mount(EventList, { props: { events: events(), collapsible: true } });
    const names = wrapper.findAll('.event-group')[1].findAll('.card-name').map((n) => n.text());
    expect(names).toHaveLength(2);
  });

  it('puts the single toggle on the first heading, above the ongoing cards', () => {
    const wrapper = mount(EventList, { props: { events: events(), collapsible: true } });
    const toggles = wrapper.findAll('.group-toggle');
    expect(toggles).toHaveLength(1);
    expect(wrapper.findAll('.event-group')[0].find('.group-toggle').exists()).toBe(true);
    expect(toggles[0].text()).toBe('timeline.showAll');
  });

  it('View all shows literally everything', async () => {
    const wrapper = mount(EventList, { props: { events: events(), collapsible: true } });
    await wrapper.find('.group-toggle').trigger('click');

    expect(groupsShown(wrapper)).toEqual([
      ['timeline.ongoing', 4], ['timeline.upcoming', 4], ['timeline.tba', 1],
    ]);
    expect(wrapper.find('.group-toggle').text()).toBe('timeline.showLess');
  });

  it('View less returns to exactly the state before View all was pressed', async () => {
    const wrapper = mount(EventList, { props: { events: events(), collapsible: true } });
    const before = wrapper.findAll('.event-card').map((c) => c.text());

    await wrapper.find('.group-toggle').trigger('click');
    await wrapper.find('.group-toggle').trigger('click');

    expect(wrapper.findAll('.event-card').map((c) => c.text())).toEqual(before);
    expect(wrapper.find('.group-toggle').text()).toBe('timeline.showAll');
  });

  it('hides the toggle when View less would hide nothing', () => {
    const wrapper = mount(EventList, {
      props: { events: [ongoing('o1'), upcomingIn('soon', 3)], collapsible: true },
    });
    expect(wrapper.find('.group-toggle').exists()).toBe(false);
  });

  it('keeps the toggle reachable when only far-off events exist', async () => {
    const wrapper = mount(EventList, {
      props: { events: [upcomingIn('far', 20)], collapsible: true },
    });
    expect(wrapper.findAll('.event-card')).toHaveLength(0);
    await wrapper.find('.group-toggle').trigger('click');
    expect(wrapper.findAll('.event-card')).toHaveLength(1);
  });

  it('leaves ended events alone — they only appear when the user asked for them', () => {
    const wrapper = mount(EventList, {
      props: { events: [ongoing('o1'), ended('e1'), ended('e2')], collapsible: true },
    });
    expect(groupsShown(wrapper)).toEqual([['timeline.ongoing', 1], ['timeline.ended', 2]]);
  });

  it('never simplifies unless asked — the home widget keeps its own hard limit', () => {
    const wrapper = mount(EventList, { props: { events: events() } });
    expect(wrapper.findAll('.event-card')).toHaveLength(9);
    expect(wrapper.find('.group-toggle').exists()).toBe(false);
  });
});

describe('EventGantt', () => {
  const banner = makeEvent({ id: 'banner-1', category: 'banner', name: 'Banner One' });
  const event = makeEvent({ id: 'event-1', category: 'event', name: 'Event One' });

  it('renders one bar per event across banner and event tracks', () => {
    const wrapper = mount(EventGantt, { props: { events: [banner, event], now: NOW } });
    expect(wrapper.findAll('.gantt-bar')).toHaveLength(2);
    expect(wrapper.findAll('.track-label')).toHaveLength(2);
  });

  it('draws the today marker when now falls inside the range', () => {
    const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
    expect(wrapper.find('.today-line').exists()).toBe(true);
  });

  it('positions a later event further right than an earlier one', () => {
    const early = makeEvent({ id: 'early', start: NOW, end: NOW + DAY });
    const late = makeEvent({ id: 'late', start: NOW + 10 * DAY, end: NOW + 11 * DAY });
    const wrapper = mount(EventGantt, { props: { events: [early, late], now: NOW } });

    const lefts = wrapper.findAll('.gantt-bar').map((bar) => parseFloat(bar.element.style.left));
    expect(lefts[1]).toBeGreaterThan(lefts[0]);
  });

  it('renders month and day axis ticks', () => {
    const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
    expect(wrapper.findAll('.axis-month').length).toBeGreaterThan(0);
    expect(wrapper.findAll('.axis-day').length).toBeGreaterThan(0);
  });

  it('shows the empty state with no events', () => {
    const wrapper = mount(EventGantt, { props: { events: [], now: NOW } });
    expect(wrapper.findAll('.gantt-bar')).toHaveLength(0);
    expect(wrapper.find('.gantt-empty').exists()).toBe(true);
  });

  it('clamps zoom-out at the minimum day width', async () => {
    const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
    const zoomOut = wrapper.findAll('.zoom-btn')[0];

    for (let i = 0; i < 10; i++) {
      if (zoomOut.element.disabled) break;
      await zoomOut.trigger('click');
    }
    expect(zoomOut.element.disabled).toBe(true);
  });

  /**
   * Stepping the width by a constant and clamping it left the default off the
   * grid: 22 → 16 → 10 → 8 going out, then 8 → 14 → 20 → 26 coming back, so the
   * chart could never be returned to how it looked.
   */
  describe('zoom is reversible', () => {
    const dayWidth = (wrapper) =>
      parseFloat(wrapper.findAll('.axis-day')[0].element.style.width);

    it('returns to the starting width after zooming all the way out and back', async () => {
      const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
      const [zoomOut, zoomIn] = wrapper.findAll('.zoom-btn');
      const before = dayWidth(wrapper);

      let steps = 0;
      while (!zoomOut.element.disabled) {
        await zoomOut.trigger('click');
        steps++;
      }
      expect(steps).toBeGreaterThan(0);
      expect(dayWidth(wrapper)).toBeLessThan(before);

      for (let i = 0; i < steps; i++) await zoomIn.trigger('click');
      expect(dayWidth(wrapper)).toBe(before);
    });

    it('returns to the starting width after zooming all the way in and back', async () => {
      const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
      const [zoomOut, zoomIn] = wrapper.findAll('.zoom-btn');
      const before = dayWidth(wrapper);

      let steps = 0;
      while (!zoomIn.element.disabled) {
        await zoomIn.trigger('click');
        steps++;
      }
      for (let i = 0; i < steps; i++) await zoomOut.trigger('click');
      expect(dayWidth(wrapper)).toBe(before);
    });

    it('reset puts the width back from anywhere', async () => {
      const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
      const zoomOut = wrapper.findAll('.zoom-btn')[0];
      const reset = wrapper.findAll('.today-btn')[0];
      const before = dayWidth(wrapper);

      await zoomOut.trigger('click');
      await zoomOut.trigger('click');
      expect(dayWidth(wrapper)).not.toBe(before);

      await reset.trigger('click');
      expect(dayWidth(wrapper)).toBe(before);
    });

    // Gating it on "zoom differs from the default" left a button that looked
    // ordinary but ignored clicks — indistinguishable from one that isn't there.
    it('the reset button is never disabled', async () => {
      const wrapper = mount(EventGantt, { props: { events: [event], now: NOW } });
      const reset = wrapper.findAll('.today-btn')[0];
      expect(reset.element.disabled).toBe(false);

      await wrapper.findAll('.zoom-btn')[0].trigger('click');
      expect(reset.element.disabled).toBe(false);
    });
  });
});
