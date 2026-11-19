# TCP vs UDP — Explainer Video Script

**Topic:** TCP and UDP, two ways to send data over the internet.
**Takeaway:** TCP makes sure every packet arrives, in order, by waiting for acknowledgments and retransmitting lost ones. UDP just sends packets without checking. That makes UDP faster, so it's used for video calls and games, while TCP is used for web pages and file downloads.

**Target length:** ~2:30 · 1920×1080 · 30 fps
**Stack:** Remotion (visuals) · Kokoro (narration, voice `af_heart`) · ffmpeg (combine + compress)

---

## Visual language (keep the same in every scene)

| Element | Look |
|---|---|
| Background | dark navy `#0f172a` |
| Sender / Receiver | rounded boxes `#1e293b`, labeled "Sender" (left) and "Receiver" (right) |
| The network | a dashed horizontal "wire" between them |
| TCP | blue `#38bdf8`, used for TCP packets, labels, the TCP side of split screens |
| UDP | orange `#f59e0b`, same for UDP |
| ACK | small green `#22c55e` packet travelling **right → left**, labeled `ACK n` |
| Lost packet | turns red `#ef4444`, shakes, and fades out with a small ✕ |
| Packet | rounded rectangle with a number on it (`1`, `2`, `3` …) |

All drawings are made in code (divs / SVG). No generated images.

---

## Scene list

| # | File | Title | Est. length |
|---|---|---|---|
| 1 | `src/scenes/S01Intro.tsx` | Two ways to send data | ~10 s |
| 2 | `src/scenes/S02Packets.tsx` | Data travels in packets | ~15 s |
| 3 | `src/scenes/S03TcpAck.tsx` | TCP: numbering and acknowledgments | ~20 s |
| 4 | `src/scenes/S04TcpLoss.tsx` | TCP: a packet gets lost | ~22 s |
| 5 | `src/scenes/S05TcpOrder.tsx` | TCP: putting packets back in order | ~15 s |
| 6 | `src/scenes/S06Udp.tsx` | UDP: fire and forget | ~18 s |
| 7 | `src/scenes/S07Race.tsx` | The race: why UDP is faster | ~18 s |
| 8 | `src/scenes/S08UseCases.tsx` | Who uses which | ~22 s |
| 9 | `src/scenes/S09Recap.tsx` | Recap | ~12 s |

Narration audio per scene: `public/narration/s01.wav` … `public/narration/s09.wav`.
Each scene's duration = its narration length + ~1 s padding.

---

## Scene 1 — Two ways to send data (~10 s)

**Visual:**
- Title "TCP vs UDP" fades in at the top.
- Sender box on the left, Receiver box on the right, dashed wire between them.
- The wire splits into two lanes: the top lane is labeled **TCP** in blue, the bottom one **UDP** in orange.

**Narration:**
> Every time you load a web page or join a video call, your computer sends data across the internet. There are two main ways to do it: TCP and UDP.

---

## Scene 2 — Data travels in packets (~15 s)

**Visual:**
- A long bar labeled "your data" sits inside the Sender box.
- It gets sliced into five equal pieces, and each piece becomes a numbered packet `1`–`5`.
- The packets fly one by one along the wire to the Receiver.
- A small caption under the wire: "the network can lose or reorder packets".

**Narration:**
> Data isn't sent all at once. It's chopped into small pieces called packets, and each one travels across the network on its own. Along the way, packets can be delayed, arrive out of order, or get lost completely.

---

## Scene 3 — TCP: numbering and acknowledgments (~20 s)

**Visual:**
- Blue "TCP" label in the top-left corner.
- Packet `1` (blue) travels Sender → Receiver.
- On arrival, a green `ACK 1` travels back Receiver → Sender. A ✓ appears next to the Sender.
- Repeat for packets `2` and `3`, a little faster each time.
- A small clock icon near the Sender ticks while it waits for each ACK, to show the waiting.

**Narration:**
> TCP is the careful one. It numbers every packet, and for each packet that arrives, the receiver sends back a short reply called an acknowledgment, or ACK. The sender keeps track of which packets have been acknowledged, so it always knows what got through.

---

## Scene 4 — TCP: a packet gets lost (~22 s)

**Visual:**
- Packets `1`, `2`, `3` leave the Sender.
- Halfway along the wire, packet `2` turns red, shakes, and disappears with a ✕.
- `1` and `3` arrive. `ACK 1` and `ACK 3` come back, but no `ACK 2`.
- The Sender's timer for packet `2` fills up, then flashes "timeout!".
- A new copy of packet `2` is sent (with a "resend" label). It arrives and `ACK 2` comes back.
- The Receiver now shows `1 2 3` with a green check.

**Narration:**
> So what happens when a packet gets lost? The sender waits for its acknowledgment, and when it doesn't arrive in time, the sender simply sends that packet again. TCP keeps retransmitting until every single packet has been acknowledged. Nothing goes missing.

---

## Scene 5 — TCP: putting packets back in order (~15 s)

**Visual:**
- Packets arrive at the Receiver out of order: `3`, `1`, `4`, `2`.
- They land in a "buffer" tray inside the Receiver in the order they arrived.
- They then slide around and line up into slots `1 2 3 4`.
- The pieces merge back into the original "your data" bar.

**Narration:**
> Packets can also take different paths and arrive out of order. Because every packet is numbered, TCP puts them back into the right order before handing the data to your app. You get exactly what was sent, in exactly the right order.

---

## Scene 6 — UDP: fire and forget (~18 s)

**Visual:**
- Switch to the orange color scheme, "UDP" label in the top-left.
- The Sender fires packets `1`–`6` quickly, one after another, with no pauses.
- No ACKs travel back. The return lane is empty, with a faint "no replies" caption.
- Packet `4` turns red and disappears. Nobody reacts and nothing is resent.
- The Receiver shows `1 2 3 _ 5 6` with a visible gap.

**Narration:**
> UDP takes the opposite approach. It just sends packets, one after another, without waiting for any replies. There are no acknowledgments and no retransmissions. If a packet gets lost, it's simply gone, and the sender never even finds out.

---

## Scene 7 — The race: why UDP is faster (~18 s)

**Visual:**
- Split screen: TCP lane on top (blue), UDP lane on the bottom (orange). Same 6 packets to send in each.
- Both start at the same time. The TCP lane sends, waits for ACKs, resends one lost packet. The UDP lane streams everything straight through.
- A timer above each lane counts up. UDP finishes first and its timer stops, e.g. "0.6 s". TCP keeps going and finishes later, e.g. "1.4 s". (These are illustrative numbers, and the video says so with a small "illustration" label.)
- TCP's result: 6/6 delivered. UDP's result: 5/6 delivered.

**Narration:**
> Put them side by side and you see the trade-off. All that waiting and checking takes time. UDP skips it, so it's faster and has less delay, but it gives no guarantees. TCP is slower, but it's reliable.

---

## Scene 8 — Who uses which (~22 s)

**Visual:**
- Two columns. Blue **TCP** on the left, orange **UDP** on the right.
- TCP column, icons drawn in code popping in one by one: 🌐 web page (a browser window outline), 📄 file download (a file with a progress bar), ✉️ email.
- UDP column: 📹 video call (a webcam window with two faces), 🎮 online game (a simple controller shape), 📺 live stream.
- For the video call, a quick beat: one frame glitches for a moment and the call keeps going. Caption: "a lost frame is better than a frozen call".
- For the file download, a quick beat: a file with one missing chunk shows a broken icon. Caption: "a file with a missing piece is broken".

**Narration:**
> That's why each one has its job. Web pages and file downloads use TCP, because a single missing piece would break the page or corrupt the file. Video calls and online games use UDP. If one frame is lost, you barely notice, but if everything paused to resend old data, the call would freeze and the game would lag.

---

## Scene 9 — Recap (~12 s)

**Visual:**
- Two cards side by side.
  - **TCP** (blue): ✓ every packet arrives · ✓ in order · ✓ ACKs and retransmission · slower
  - **UDP** (orange): ⚡ fast · ⚡ low delay · ✗ no checking · packets may be lost
- Bottom line fades in: "Reliable or fast: pick what your app needs."

**Narration:**
> To sum up: TCP is reliable. It waits for acknowledgments and resends anything lost. UDP is fast. It sends and never looks back. Pick the one your app needs.

---

## Production notes

- **Narration:** generate one file per scene:
  `.venv/bin/python narration/tts.py "<text>" public/narration/s0N.wav af_heart 1.0`
  and set each scene's `durationInFrames` from the printed length (seconds × 30 + ~30 frames of padding).
- **Assembly:** one `Main` composition in `src/Root.tsx` that chains the scenes with `<Series>`; each scene plays its own `<Audio>`.
- **Renders:** never overwrite. `out/render-01.mp4`, `out/render-02.mp4`, …
- **Compression (final):** `ffmpeg -i out/render-NN.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k out/final-NN.mp4`
- **Build order:** S01 → S02 → S03 → S04 first (the core TCP story), then S06, S07, S08, then S05 and S09. If time runs short, S05 can be cut.
