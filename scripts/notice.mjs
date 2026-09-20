// The not-affiliated statement, written once and used everywhere.
//
// Every page this repo serves and the README carry it verbatim; check.sh fails
// if any of them drifts. It is not fine print and it is not a disclaimer bolted
// on by a lawyer — it is the first true thing to say about this repo, so it is
// said in the same words in every place, and only edited here.

export const NOTICE =
  'Not affiliated with, endorsed by, or produced for Nous Research. ' +
  'No Hermes Agent code is vendored or forked here, and nothing here is a contribution to the project’s own codebase. ' +
  'This is one heavy user’s work built around the tool and offered back. ' +
  'Where anything here disagrees with the official Hermes Agent documentation, the official documentation is right.'

export const FRAMING =
  'A heavy user and vibecoder’s attempt to give something back to Hermes Agent. ' +
  'Not a product, not a landing page, not a company.'

export const noticeHtml = () =>
  `<aside class="notice" id="unaffiliated"><strong>Unaffiliated.</strong> ${NOTICE}</aside>`
