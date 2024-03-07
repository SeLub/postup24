const SentryMixin = require('moleculer-sentry')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')

module.exports = {
  mixins: [SentryMixin],

  settings: {
    /** @type {Object?} Sentry configuration wrapper. */
    sentry: {
      /** @type {String} DSN given by sentry. */
      dsn: "https://e613217a9cc33f09293e3863fe0f55d3@o4504631757832192.ingest.us.sentry.io/4506868456161280",
      /** @type {String} Name of event fired by "Event" exported in tracing. */
      tracingEventName: '$tracing.spans',
      /** @type {Object} Additional options for `Sentry.init`. */
      options: {
            integrations: [
                  new nodeProfilingIntegration(),
                ],
            // Performance Monitoring
            tracesSampleRate: 1.0, //  Capture 100% of the transactions
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,
      },
      /** @type {String?} Name of the meta containing user infos. */
      userMetaKey: null,
    },
  }
}