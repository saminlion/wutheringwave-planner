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
});
