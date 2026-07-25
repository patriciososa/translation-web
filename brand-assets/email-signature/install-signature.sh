#!/bin/bash
# Installs an HTML signature into Apple Mail by writing the .mailsignature file
# directly.
#
# Why not just paste into Mail → Settings → Signatures: the editor downloads any
# remote image, re-embeds it as a base64 attachment at its NATURAL size (512px
# here), rewrites the markup into multipart/related, and mangles the table. This
# writes a clean single-part text/html signature instead, so the 46px sizing and
# the remote logo URL survive.
#
#   ./install-signature.sh                                  # list signatures
#   ./install-signature.sh <uuid|name-fragment> <file.html>  # install
#
set -euo pipefail
cd "$(dirname "$0")"

# Signatures live in one of two places. With Mail enabled in iCloud Drive they
# sync from Mobile Documents (note: no MailData level there); otherwise they sit
# under ~/Library/Mail, which needs Full Disk Access to read.
SIG_DIR=""
for candidate in \
  "$HOME/Library/Mobile Documents/com~apple~mail/Data"/V*/Signatures \
  "$HOME/Library/Mail"/V*/MailData/Signatures
do
  [ -d "$candidate" ] && SIG_DIR="$candidate"
done

if [ -z "$SIG_DIR" ]; then
  echo "No Mail signatures directory found. Either no signature exists yet, or"
  echo "this terminal lacks Full Disk Access (System Settings → Privacy &"
  echo "Security → Full Disk Access) to read ~/Library/Mail."
  exit 1
fi

PLIST="$SIG_DIR/AllSignatures.plist"

list_signatures() {
  echo "Signatures directory:"
  echo "  $SIG_DIR"
  echo
  for f in "$SIG_DIR"/*.mailsignature; do
    [ -e "$f" ] || continue
    uuid=$(basename "$f" .mailsignature)
    name=$(plutil -p "$PLIST" 2>/dev/null \
      | grep -B2 "$uuid" | grep SignatureName | sed 's/.*=> "//; s/"$//' || true)
    ls -lO "$f" | grep -q uchg && lock=" [locked]" || lock=""
    size=$(stat -f%z "$f")
    printf '  %s%s\n      name: %s\n      size: %s bytes%s\n' \
      "$uuid" "$lock" "${name:-unnamed}" "$size" \
      "$([ "$size" -gt 5000 ] && echo '  <- large: image is embedded' || echo '')"
  done
}

if [ $# -lt 2 ]; then
  list_signatures
  echo
  echo "Install with:  $0 <uuid-or-name-fragment> signature-info.html"
  exit 0
fi

SOURCE="$2"
[ -f "$SOURCE" ] || { echo "No such HTML file: $SOURCE"; exit 1; }

# Accept either a UUID or a fragment of the signature's display name.
TARGET=$(ls "$SIG_DIR"/*.mailsignature 2>/dev/null | grep -i "$1" || true)
if [ -z "$TARGET" ]; then
  uuid=$(plutil -p "$PLIST" 2>/dev/null | grep -A2 -i "$1" \
    | grep SignatureUniqueId | sed 's/.*=> "//; s/"$//' | head -1 || true)
  [ -n "$uuid" ] && TARGET="$SIG_DIR/$uuid.mailsignature"
fi
[ -n "$TARGET" ] && [ -f "$TARGET" ] || { echo "No signature matched '$1'."; list_signatures; exit 1; }
[ "$(printf '%s\n' "$TARGET" | wc -l)" -eq 1 ] || { echo "'$1' matched more than one signature."; exit 1; }

if pgrep -xq Mail; then
  echo "Quit Mail first (Cmd-Q — closing the window is not enough), then re-run."
  echo "Mail holds these files open and rewrites them on quit."
  exit 1
fi

chflags nouchg "$TARGET" 2>/dev/null || true

BACKUP="$TARGET.bak.$(date +%Y%m%d%H%M%S)"
cp "$TARGET" "$BACKUP"

# Mail matches a signature to its account by Message-Id, so carry the existing
# one over. Everything else is rebuilt: the old file may be multipart/related
# with a megabyte of base64 in it.
# tr -d '\r' matters: if the file being replaced had CRLF headers, the captured
# value keeps its trailing CR and the rebuilt file ends up with mixed line
# endings, which Mail treats as a malformed signature (blank, no error).
MSGID=$(grep -a -m1 '^Message-Id:' "$TARGET" | sed 's/^Message-Id: *//' | tr -d '\r')
[ -n "$MSGID" ] || MSGID="<$(uuidgen)>"

# Carry over Mail's own Mime-Version string (it embeds the app build) if present.
MIMEVER=$(grep -a -m1 '^Mime-Version:' "$TARGET" | sed 's/^Mime-Version: *//' | tr -d '\r')
[ -n "$MIMEVER" ] || MIMEVER='1.0'

# us-ascii unless the HTML actually needs more; matches what Mail writes.
if LC_ALL=C grep -q '[^ -~	]' "$SOURCE"; then CHARSET=utf-8; else CHARSET=us-ascii; fi

# The format below is copied from a signature Mail generated itself. Two details
# are load-bearing: the header block uses LF (not CRLF), and the content must be
# wrapped in a <body> element — Mail renders a blank signature for a bare
# fragment, with no error anywhere.
{
  printf 'Content-Transfer-Encoding: 7bit\n'
  printf 'Content-Type: text/html;\n\tcharset=%s\n' "$CHARSET"
  printf 'Message-Id: %s\n' "$MSGID"
  printf 'Mime-Version: %s\n' "$MIMEVER"
  printf '\n'
  printf '<body dir="auto" style="overflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">'
  cat "$SOURCE"
  printf '</body><br class="Apple-interchange-newline">\n'
} > "$TARGET.new"

mv "$TARGET.new" "$TARGET"
chflags uchg "$TARGET"   # Mail rewrites signature files on quit; this stops it.

# Don't take the lock on trust: on iCloud-synced signatures the sync daemon can
# rewrite the file moments later and clear the flag.
if ls -lO "$TARGET" | grep -q uchg; then
  locked="yes — to edit later, chflags nouchg on the file"
else
  locked="NO — chflags did not stick (iCloud sync may have cleared it). Re-run
            chflags uchg on the file, or Mail may revert this on next quit."
fi

# Keep backups out of the Signatures directory: Mail and iCloud both scan it.
mkdir -p ./signature-backups && mv "$BACKUP" ./signature-backups/

echo "Installed $SOURCE -> $(basename "$TARGET")"
echo "  backup:   signature-backups/$(basename "$BACKUP")"
echo "  size now: $(stat -f%z "$TARGET") bytes (was $(stat -f%z "./signature-backups/$(basename "$BACKUP")"))"
echo "  locked:   $locked"
echo
echo "Reopen Mail and check the signature in Settings → Signatures."
