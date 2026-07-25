# Apple Mail signature — Bluelab Translations

HTML signatures for the Migadu mailboxes configured in Apple Mail.

| File | Use |
|---|---|
| `signature-info.html` | `info@translations.bluelab.ar` — clients, quotes |
| `signature-jobs.html` | `jobs@translations.bluelab.ar` — translator candidates |
| `preview.html` | Open in a browser to see both, including a dark-background check |

Palette and type mirror `archive-browser/src/step-email.ts` (navy `#101a3d`, blue
`#2563eb`, muted `#8a94a6`, Arial) so manual replies match the automated project
emails. The logo is loaded from `https://translations.bluelab.ar/brand-logo.png`
— the same URL `EMAIL_LOGO_URL` uses, so it is already public and cached.

## Account setup in Apple Mail (Migadu)

Mail → Settings → Accounts → **+** → Other Mail Account.

| | |
|---|---|
| Incoming (IMAP) | `imap.migadu.com`, port 993, SSL |
| Outgoing (SMTP) | `smtp.migadu.com`, port 465, SSL |
| Username | the full address (`info@translations.bluelab.ar`) |
| Password | that mailbox's own password |

Add `jobs@` as a **separate account**, not as an extra address on the `info@`
account. Apple Mail assigns signatures per account, so an alias sharing one
account would force you to pick the right signature by hand on every message.
Migadu identities carry their own password, which is what makes the second
account possible.

## Installing the signature

**Do not paste these into Mail → Settings → Signatures.** The editor downloads
the remote logo, re-embeds it as base64 at its natural 512×512 (turning a 1.4 KB
signature into 18 KB), rewrites the document as `multipart/related`, replaces
the `<img>` with `<OBJECT height=512 width=512 …>`, and mangles the table into
malformed markup. The 46px sizing does not survive, in either the attribute or
the inline style.

Use `install-signature.sh`, which writes the `.mailsignature` file directly:

```sh
./install-signature.sh                             # list installed signatures
# quit Mail first — Cmd-Q, not just closing the window
./install-signature.sh info signature-info.html
./install-signature.sh jobs signature-jobs.html
```

It creates the signature in Mail first (you still need a placeholder signature
per account so the file exists), then rebuilds it as single-part `text/html`,
carrying over the existing `Message-Id` — Mail matches signatures to accounts by
that header, so losing it detaches the signature from the account.

### Where the files actually live

Two possible locations, and the script checks both:

- **Mail enabled in iCloud Drive** (this Mac):
  `~/Library/Mobile Documents/com~apple~mail/Data/V4/Signatures/`
  Note there is no `MailData` level here. Readable without Full Disk Access.
- **Local only:** `~/Library/Mail/V*/MailData/Signatures/`
  Requires Full Disk Access; a shell without it reports "Operation not
  permitted", or the glob silently finds nothing.

`AllSignatures.plist` in the same directory maps each UUID filename to its
display name.

### The file format Mail requires

A `.mailsignature` file is picky, and Mail reports nothing when it is wrong — the
signature simply renders blank in both the Settings preview and the compose
window. Three details are load-bearing:

```
Content-Transfer-Encoding: 7bit
Content-Type: text/html;
	charset=us-ascii                       ← folded continuation, TAB-indented
Message-Id: <UUID>                         ← binds signature to account; keep it
Mime-Version: 1.0 (Mac OS X Mail 16.0 \(3826.700.81.1.8\))

<body dir="auto" style="…">YOUR HTML</body><br class="Apple-interchange-newline">
```

1. **The HTML must be wrapped in a `<body>` element.** A bare `<table>` fragment
   renders blank.
2. **LF line endings, never CRLF** — and no mixed endings. Grepping a header out
   of a CRLF file carries the `\r` into the rebuilt file and breaks it.
3. Keep the existing `Message-Id`.

The script handles all three; `signature-*.html` stay bare fragments, and the
`<body>` wrapper is added at install time.

### The lock

Mail rewrites signature files when it quits, which would undo the install, so
the script sets `chflags uchg`. On iCloud-synced signatures the sync daemon can
clear that flag again moments later — the script now verifies and warns instead
of assuming. Check with `ls -lO`, and re-apply `chflags uchg` if the flag is
gone. To edit a signature in Mail's own editor again, `chflags nouchg` first.

## Notes

- The explicit `background:#ffffff` is deliberate. Apple Mail's dark mode
  inverts content that declares no background, which turned the navy name and
  half the logo invisible. With it, the signature stays a readable white card in
  dark clients and looks unchanged everywhere else.
- The logo is a remote image, so clients that block remote content show a gap
  until the recipient loads images. That is the same tradeoff the Resend project
  emails already make. The alternative — dragging the PNG into the signature
  editor — embeds it as an attachment, which shows a paperclip on every message.
- Keep the two files in sync when the brand changes; `signature-jobs.html` is
  just `signature-info.html` with the address swapped:
  `sed 's/info@/jobs@/g' signature-info.html > signature-jobs.html`
