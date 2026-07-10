/**
 * Anonymous analytics event contract (V3 §4.1).
 * STRUCTURAL PII PROHIBITION: no free-text fields exist; every property is a
 * closed enum, a categorical id, or a derived boolean. The privacy page
 * publishes this list verbatim (M11 automated diff).
 */

import type { LocaleCode } from './locale.js';

export type DeviceClass = 'mobile' | 'desktop';

interface EventBase {
  /** Random UUID, memory-only, never persisted or linked (V3 §4.1). */
  readonly sessionId: string;
  readonly occurredAtIso: string;
  readonly rulePackVersion: string;
}

export type AnalyticsEvent =
  | (EventBase & {
      readonly type: 'session_start';
      readonly locale: LocaleCode;
      readonly deviceClass: DeviceClass;
      readonly entryPage: 'home' | 'start' | 'learn' | 'fix' | 'claims' | 'other';
    })
  | (EventBase & { readonly type: 'step_view'; readonly stepId: string })
  | (EventBase & {
      readonly type: 'answer';
      readonly questionId: string;
      /**
       * Closed option id only. For the death month/year question this field
       * is FORBIDDEN; only the derived booleans below may be sent.
       */
      readonly optionId?: string;
      readonly over6Months?: boolean;
      readonly over10Years?: boolean;
    })
  | (EventBase & { readonly type: 'route_assigned'; readonly routeId: string })
  | (EventBase & { readonly type: 'overlay_flagged'; readonly flagId: string })
  | (EventBase & { readonly type: 'card_shown'; readonly cardId: string })
  | (EventBase & {
      readonly type: 'checklist_generated';
      readonly schemesCountBucket: '1' | '2' | '3+' ;
      readonly routeIds: readonly string[];
    })
  | (EventBase & { readonly type: 'pdf_download'; readonly variant: LocaleCode | 'large' })
  | (EventBase & { readonly type: 'print'; readonly variant: LocaleCode | 'large' })
  | (EventBase & { readonly type: 'fix_view'; readonly issueSlug: string })
  | (EventBase & { readonly type: 'learn_view'; readonly pageSlug: string })
  | (EventBase & { readonly type: 'claims_view'; readonly pageSlug: string })
  | (EventBase & { readonly type: 'resume' })
  | (EventBase & { readonly type: 'clear_answers' })
  | (EventBase & { readonly type: 'abandon'; readonly lastStepId: string });

export type AnalyticsEventType = AnalyticsEvent['type'];
