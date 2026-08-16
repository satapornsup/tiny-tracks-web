# Tiny Tracks Web — Interactive Story Site

## ภาพรวมโปรเจกต์

เว็บไซต์ interactive แนว "เกม/เรื่องเล่า" ให้ผู้ปกครองอ่านเนื้อเรื่อง ตอบคำถาม 6 ข้อ แล้วได้สรุปผล

- ข้อควรปฏิบัติ + ถ่ายภาพ (Photo Booth) เพื่อโปรโมทแคมเปญ "Tiny Tracks"

**Reference files** (ต้นฉบับอยู่ที่ `/Users/nongtub/Downloads/tiny tracks web/`):

- `01.png` — flow diagram (state machine) ของทั้งเว็บ: START → STORY → HOME → Q1-Q6 → สรุปผล → ข้อควรปฏิบัติ → PHOTO BOOTH → CONCEPT + เมนู hamburger แยกต่างหาก
- `02.png` — visual/screen-by-screen reference (มี wireframe จริงของแต่ละหน้า + flow arrow ปนกัน) — **ละเอียดกว่า 01.png** ควรยึดเป็นหลักตอนเขียน component
- `element/` — asset ที่ designer export ออกมาแล้ว (PNG/WebP) แยกตามหมวด: `home/`, `ข้อควรปฎิบัติ/`, root

> หมายเหตุ: ผู้ใช้บอกว่า "รูปแรก = visual" และ "รูปที่สอง = flow" แต่จากการเปิดไฟล์จริง มันสลับกัน — `01.png` คือ flow diagram ล้วนๆ, `02.png` คือ visual mockup ทุกหน้า พร้อม flow แทรกอยู่ด้วย เอกสารนี้อ้างอิงตามเนื้อหาจริงที่เห็นในไฟล์

**Tech stack ที่กำหนด**:

- Angular + TypeScript (standalone components, Signals สำหรับ state)
- GSAP สำหรับ animation/transition (CSS ใช้กับ micro-interaction ง่ายๆ)
- ใช้ asset ที่มีอยู่แล้ว — ไม่ออกแบบใหม่
- ไม่ใช้ WebGL/Three.js (ดีไซน์ปัจจุบันทำได้หมดด้วย DOM + CSS + GSAP ไม่มีจุดไหนจำเป็นต้องใช้ WebGL)

---

## 1. Flow ทั้งหมด (อัปเดต 2026-08-16 — คุยกับ user ตรงๆ แล้ว ไม่ใช่แค่จาก mockup)

```
START ──▶ STORY (คลิป → เนื้อเรื่อง ซูมเอกสาร) ──▶ HOME ──▶ Q1 ──▶ Q2 ──▶ Q3 ──▶ Q4 ──▶ Q5 ──▶ Q6 ──▶ สรุปผล ──▶ ข้อควรปฏิบัติ ──▶ PHOTO BOOTH ──▶ CONCEPT
```

เมนู hamburger (มุมขวาบนของทุกหน้า ยกเว้น START) เปิด side drawer แบบ "แฟ้มเอกสาร" (folder-tab) เข้าถึงได้ทุกที่:
`HOME · เนื้อเรื่อง (STORY) · ข้อควรปฏิบัติ · PHOTO BOOTH · CONCEPT`

### ไม่มีแตกสาย "สรุปผล 1 (ถูก) / สรุปผล 2 (ผิด)" อีกแล้ว — confirm กับ user แล้ว 2026-08-16

mockup เดิม (02.png) ดูเหมือนมีสาย "ถูก"/"ผิด" คู่ขนานจบที่สรุปผลคนละหน้า — **ยกเลิกแนวคิดนี้แล้ว**:

- ผู้เล่นตอบครบ **ทั้ง 6 ข้อเสมอ** ไม่มีแตกสายระหว่างทาง ไม่มีเฉลยทีละข้อระหว่างเล่น
- หน้า `/result` เป็นหน้าเดียว (ไม่ใช่ result1/result2) แสดง **recap คำตอบทั้ง 6 ข้อ** ว่าแต่ละข้อผู้เล่นเลือกอะไร ถูกหรือผิด
- สีเขียว/แดงใน 02.png ยังคงเป็น annotation สำหรับ dev เท่านั้น (ไม่ใช่ UI จริง) — แต่ตอนนี้แค่บอกว่า choice ไหน "นับเป็นคำตอบถูก" สำหรับ recap ไม่ได้ใช้ตัดสินแตกสายแล้ว

---

## 2. Angular Component Architecture

แนะนำ **standalone components** ทั้งหมด + Angular **Signals** สำหรับ state (ไม่ใช้ NgRx — flow เชิงเส้นไม่ซับซ้อนพอจะคุ้ม)

### 2.1 Routing

ใช้ Angular Router เพื่อ deep-link/back-button ได้ แต่ page-transition (exit-then-enter, GSAP timeline) ควบคุมเองผ่าน `PageTransitionService` ไม่พึ่ง `@angular/animations` router-outlet animation (มันไม่พอสำหรับ timeline ซับซ้อนแบบนี้)

```
/                     → StartComponent
/story                → StoryComponent (clip + เนื้อเรื่อง สอง step ในตัวเดียว)
/home                 → HomeComponent
/question/:id         → QuestionShellComponent (data-driven, id = 1-6) — canActivate: [quizGuard]
/result               → ResultComponent (อ่านจาก QuizStateService) — canActivate: [quizGuard]
/safety               → SafetyTipsComponent (ข้อควรปฏิบัติ)
/photo-booth          → PhotoBoothComponent
/concept              → ConceptComponent
```

`quizGuard` เช็ก `quizState.hasEntered()` — ถ้า false (refresh มา หรือพิมพ์ URL ตรงเข้ามาโดยไม่ผ่าน Home) เด้งไป `/` ทันที (รายละเอียดกลไก ดูข้อ 7)

### 2.2 Layout / Shared (ใช้ซ้ำทุกหน้า ยกเว้น Start)

| Component                                                            | หน้าที่                                                                                                             | Asset อ้างอิง                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppHeaderComponent`                                                 | แถบบนสุด: โลโก้ + ปุ่ม hamburger — มี `bare` input ทำ variant เปล่า (แถบสีพื้นล้วน ไม่มีโลโก้/ปุ่ม) ใช้ในหน้า Start | **implement แล้ว**: crop `หัว.webp` เฉพาะส่วนโลโก้+รอยหยักโค้ง (`header-tab.webp`, 1800×651) วางเป็น `<img>` ลอยทับมุมซ้ายบนของแถบสีพื้น CSS (สีตรงกับภาพเป๊ะ `#403630` เลยไม่มีรอยต่อ) — เหตุผลที่ยังใช้ raster ตรงนี้แทนวาด CSS เอง: เส้นโค้ง S-curve ของรอยหยักซับซ้อนเกินจะสร้างด้วย CSS ให้เป๊ะ, ส่วนแถบที่เหลือ (พื้นที่ส่วนใหญ่) ยังเป็นสีทึบ CSS ล้วนเพื่อยืดเต็มความกว้างจอได้ไม่จำกัด — hamburger เป็น SVG แยกอยู่แล้ว |
| `SideMenuDrawerComponent`                                            | Drawer แบบ folder-tab เลื่อนออกจากขวา (HOME/เนื้อเรื่อง/ข้อควรปฏิบัติ/PHOTO BOOTH/CONCEPT)                          | ใช้ palette สีจาก `แฟ้ม.webp` (เขียว/ชมพู/น้ำตาล/ครีม) ทำเป็น flat CSS tab แทนภาพเดียว จะ animate ง่ายกว่า                                                                                                                                                                                                                                                                                                                       |
| `ZoomOverlayComponent`                                               | Modal เต็มจอสำหรับ "ซูมดูเอกสาร" (ใช้ใน Story + ที่อื่นในอนาคต)                                                     | `zoomwebp.webp` (ไอคอนแว่นขยาย), `X.webp` (ปิด)                                                                                                                                                                                                                                                                                                                                                                                  |
| `StickyNoteButtonComponent`                                          | ปุ่มขอบเส้นประโค้งมน เช่น "เนื้อเรื่อง ▶", "อ่านสัญญา →"                                                            | สร้างเป็น component เดียว รับ label + icon-direction แทนสร้างปุ่มใหม่ทุกที่                                                                                                                                                                                                                                                                                                                                                      |
| `FolderTabStackComponent`                                            | ภาพแฟ้มเอกสารซ้อนกัน ใช้ตอนเปลี่ยนจากสรุปผล → ข้อควรปฏิบัติ                                                         | `แฟ้ม.webp`                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `CornerPaperPatternComponent`                                        | ลายตารางไม้หมากรุกมุมจอ (Start/Story)                                                                               | ควรขอ designer ทำเป็น seamless tile จะ responsive ดีกว่าภาพก้อนเดียว                                                                                                                                                                                                                                                                                                                                                             |
| `ReducedMotionService` ไม่ใช่ component แต่ควรมีตั้งแต่แรก (ดูข้อ 7) |                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 2.3 หน้าเนื้อหา

- **`StartComponent`** — bg เต็มจอ (`start bg.webp` ผสมโลโก้ `logo bg.webp`) + ปุ่ม `start.webp`/`start bg.webp` (ปุ่ม START ขอบจุด) กด → ไป `/story`
- **`StoryComponent`** — internal state 2 step (ไม่แยก route เพราะใช้ header/เลย์เอาต์เดียวกัน): `clip` (วิดีโอ + ปุ่ม SKIP) → `read` (ฉาก "เนื้อเรื่อง" มีเอกสาร/รูป/บัตร ให้กดแว่นขยายซูมดู 2 จุด) → ปุ่ม "อ่านสัญญา →" ไป `/home` หรือ `/question/1` (ต้อง confirm ว่า HOME คือหน้าคั่นจริงๆ หรือ Story ก็คือ Home — ดู Open Question ข้อ 8.4)
- **`HomeComponent`** — ยังไม่มี mockup แยกชัดเจนจาก Story ใน 02.png (ดู Open Question)
- **`QuestionShellComponent`** — 1 component กลาง ไม่สร้างแยกทีละข้อ รับ `QuestionConfig` (data-driven) แล้ว switch ไปเรนเดอร์ sub-widget ตาม `interactionType`:
  - `QuestionSwipeCardComponent` — Q1 (การ์ดสไลด์ซ้าย/ขวาแบบโพสต์ IG + ปุ่ม POST ยืนยัน) — ตัวเลือกทั้งหมด 4 รูป มี **2 รูปที่นับเป็นคำตอบถูก** เลือกข้อไหนก็ได้ในสองข้อนั้นแล้วกด POST → ถือว่าตอบถูก (confirm 2026-08-16)
  - `QuestionTexturePickerComponent` — Q4 เลือกผ้าคลุม → ผ้าเลื่อน/ดึงเข้ามาคลุมตัวละคร (animation) → ต้องกดปุ่มยืนยันหลังเลือกก่อน ปุ่ม Next ถึงจะกดได้ (confirm 2026-08-16 — ไม่ใช่แค่ปุ่ม consent เฉยๆ ตามที่เคยเข้าใจผิดตอนคุยรอบแรก มี interaction เลือกผ้าจริงเหมือนแผนเดิม)
  - `QuestionOutfitPickerComponent` — Q5 (กริดเสื้อผ้ารอบตัวละคร คลิกแล้ว equip แบบ live preview) — เสื้อท่อนบนใส่ได้แค่ตำแหน่งบน กางเกง/กระโปรงใส่ได้แค่ตำแหน่งล่าง, มีคู่คำตอบที่ถูก 4 คู่จากตัวเลือกทั้งหมด
  - `QuestionMultipleChoiceComponent` — Q2/Q3/Q6 (ยังไม่มี visual mockup แต่ confirm แล้วว่าเป็น "คำถาม + ช้อยให้ติก" — เลย์เอาต์ยังไม่ล็อก แต่ interaction type รู้แล้ว ดูข้อ 4 และข้อ 8)
- **`CharacterStageComponent`** — ใช้ร่วมกันใน Q4/Q5: ตัวละครกลางจอ + ระบบ overlay ชั้นเสื้อผ้า/ผ้าคลุม (ดูข้อ 3.3 เรื่อง asset layering ที่ต้องขอ designer เพิ่ม)
- **`ResultComponent`** — อ่านคำตอบทั้ง 6 ข้อจาก `QuizStateService` แสดง **recap รายข้อ** (เลือกอะไร ถูก/ผิด) ไม่มีแตกสาย result1/result2 แล้ว (ดูข้อ 7) แล้ว auto-transition (ลูกศรเด้ง) ไป `/safety`
- **`SafetyTipsComponent`** — การ์ดแฟ้มพลิกดู 7 ข้อ (`file 1.webp` ... `file 7.webp` — ปัจจุบันมีแยกแค่บางไฟล์ เช่น `file 1,7.webp` ใช้ template เดียวกัน 2 ที่, `file 2,4,5,6.webp`) + ไอคอน `ปลอดภัย.png`
- **`PhotoBoothComponent`** / **`ConceptComponent`** — ยังไม่มี mockup เลย (ดู Open Question)

---

## 3. Asset: PNG/WebP vs SVG + Layer ที่ต้องขอ designer แยกเพิ่ม

### 3.1 เก็บเป็น raster (PNG/WebP) ตามเดิม — ไม่ต้องแปลง

Texture/painterly ทุกอย่างที่มีลาย grain, shadow, กระดาษ, ผ้า, ตัวละครลายเส้นสี:
`start bg.webp`, ลายไม้หมากรุกมุมจอ, กระดาษ/เอกสารทุกใบ (`thesif ele-03.webp` ฯลฯ), ผ้าคลุม/ลายเสื้อผ้าทั้งหมด, ภาพตัวละคร, บัตร ID, รูปโพลารอยด์

### 3.2 ควรทำ/ขอเป็น SVG แทน (หรือ dev สร้างเองด้วย CSS)

ไอคอนที่ต้อง interactive (คลิก/hover/สเกล) หรือใช้ dashed-stroke animation:

| ตอนนี้                                                        | ปัญหา                                      | แนะนำ                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Hamburger icon ถูก bake ไว้ใน `หัว.webp` เป็นพื้นหลังเดียวกัน | คลิกไม่ได้แยก, resize/animate ไม่ได้       | **implement แล้ว** — แยกเป็นปุ่ม SVG จริง วางทับบน header bar (โลโก้+รอยหยักโค้งยังคง crop จาก raster ไว้ ดูข้อ 2.2) |
| `zoomwebp.webp` (แว่นขยาย+วงจุดประ)                           | raster, animate scale ตอน hover ได้แต่หยาบ | SVG เพื่อทำ dash-offset "วาดวงกลม" ตอน entrance ได้                                                                  |
| `X.webp` (ปุ่มปิด)                                            | เหมือนกัน                                  | SVG                                                                                                                  |
| ลูกศร ◀▶ (Q1), ▲▼ (Q4), → (ปุ่มต่างๆ)                         | ปัจจุบัน bake ในภาพปุ่ม                    | แยกเป็น SVG icon + CSS/HTML text label เพื่อรองรับ i18n/hover state                                                  |
| ปุ่ม START (ข้อความ "START" bake เป็นภาพ)                     | เปลี่ยนข้อความ/ภาษาไม่ได้                  | ถ้า font ที่ใช้เป็น web font ได้ ให้ทำเป็น dotted-pill SVG + `<span>START</span>` จริง                               |

### 3.3 Layer ที่ "ภาพรวม" ปัจจุบันเป็นภาพ flatten เดียว → ต้องขอ designer แยกเลเยอร์ใหม่ (สำคัญสุด สำหรับ GSAP stagger)

`home.png` และ `แฟ้ม.webp` (ฉาก "โต๊ะทำงาน" ที่มีสัญญา, บัตร, รูป, คลิปหนีบ, ดินสอ, ยางลบ, สติกเกอร์โลโก้) **เป็นภาพ composite เดียว** — ถ้าอยากได้ entrance animation แบบของแต่ละชิ้นทยอยบิน/หล่นเข้ามา (ตาม theme "ของบนโต๊ะ") **ต้องขอ export แยก PNG โปร่งใสต่อชิ้น**:

- กระดาษสัญญาแผ่นหลัง (พื้น)
- กระดาษสัญญาแผ่นบน (มีตัวหนังสือ)
- กระดาษสามเหลี่ยมสีเขียว / สีชมพู (ของตกแต่ง)
- ดินสอ, ยางลบ
- รูปโพลารอยด์ + คลิปหนีบกระดาษ (แยกกัน ถ้าอยากได้ anim "คลิปหนีบติดเข้าไป")
- บัตร ID
- ป้ายสติกเกอร์โลโก้ "TINY TRACKS"
- ตราปั๊มสีชมพูเฉียงมุมล่างขวา

### 3.4 ตัวละคร (Q4/Q5) — Q5 implement แล้ว (2026-08-16), ใช้แบบ A (layer-swap)

Q5 ได้ asset จริงแล้ว (`/Users/nongtub/Downloads/tiny tracks web/คำถาม 5/`) — ไม่ใช่ 4 ถูก/12 ผิดตามที่เดาไว้เดิม จริงๆ คือ **4 ท่อนบน (2 ถูก) × 4 ท่อนล่าง (2 ถูก)** รวม 8 ชิ้น คู่ถูกทั้งหมด = ท่อนบนถูก × ท่อนล่างถูก = 4 คู่ (ตรงกับที่ user confirm) เสื้อผ้าเป็นภาพ "ชิ้นส่วนตุ๊กตากระดาษ" แบบเดียวกับที่โชว์ในกริดข้างตัวละคร (มี tab หูจับยื่นออกด้านข้าง) ไม่ใช่ภาพตัดพอดีตัว — ตอนนี้ overlay ทับตัวละครแบบประมาณตำแหน่ง (ดูข้อ 3.4.1) ยังไม่ pixel-perfect เพราะไม่มี asset เวอร์ชัน fit-ตัวละครแยกต่างหาก

- **แบบ A (layer-swap)** — เลือกใช้แบบนี้แล้ว: ตัวละคร pose เดียวคงที่ (`character-frame.webp`) + เสื้อ/กางเกงเป็น SVG แยกชิ้น overlay ทับ

**สำคัญ — ชื่อไฟล์ต้นฉบับ (`เสื้อผ้า-46.svg` ... `-53.svg`) ไม่ได้เรียงตามลำดับที่โชว์ใน mockup เลย**: ต้องเปิดดูรูปจริงทีละไฟล์ยืนยันก่อนถึงจะรู้ว่าไฟล์ไหนคือชิ้นไหน (เจอมาแล้วว่าเดาตามลำดับเลขไฟล์ผิดหมด) — ไฟล์ที่ใช้จริงตอนนี้ (คัดลอกมาเป็นชื่อสื่อความหมายแล้วที่ `public/assets/images/question/q5/`):

| ไฟล์ต้นฉบับ | ชื่อไฟล์ในโปรเจกต์ | ชนิด | คอลัมน์ mockup | ถูก/ผิด |
| --- | --- | --- | --- | --- |
| เสื้อผ้า-51.svg | top-fur-wrap.svg | บน | ซ้าย #1 | ผิด |
| เสื้อผ้า-50.svg | top-blouse-gray.svg | บน | ซ้าย #2 | ถูก |
| เสื้อผ้า-49.svg | bottom-striped-pants.svg | ล่าง | ซ้าย #3 | ถูก |
| เสื้อผ้า-53.svg | bottom-skirt-pink.svg | ล่าง | ซ้าย #4 | ผิด |
| เสื้อผ้า-47.svg | top-striped-bow.svg | บน | ขวา #1 | ถูก |
| เสื้อผ้า-46.svg | top-bikini-pink.svg | บน | ขวา #2 | ผิด |
| เสื้อผ้า-48.svg | bottom-fur-shorts.svg | ล่าง | ขวา #3 | ถูก |
| เสื้อผ้า-52.svg | bottom-shorts-gray.svg | ล่าง | ขวา #4 | ผิด |

#### 3.4.1 ของที่ยังขอ designer เพิ่มได้ (ไม่ blocking แต่จะทำให้ preview สวยขึ้น)

overlay ตำแหน่งเสื้อ/กางเกงบนตัวละครตอนนี้เป็นการกะตำแหน่ง % คร่าวๆ (ดู `question-outfit-picker.component.scss`) เพราะภาพที่มีเป็น "ชิ้นตุ๊กตากระดาษ" ที่มี tab หูจับยื่นสองข้าง ไม่ได้ crop มาพอดีตัวละคร — ถ้าอยากได้ preview แม่นๆ ควรขอ designer แยกเวอร์ชัน "fit ตัวละคร" (ไม่มี tab, ขนาด/มุมตรงกับท่าโพสของ `character-frame.webp` พอดี) ต่อชิ้นแยกจากเวอร์ชันกริดที่มีอยู่แล้ว

**สรุป: ต้องมี 2 เวอร์ชันต่อชิ้นเสื้อผ้า** (pattern มาตรฐานของเกมแต่งตัวตุ๊กตากระดาษ):
1. **แบบมีหูจับ** (มีอยู่แล้ว 8 ไฟล์) — ใช้โชว์ในกริดตัวเลือกข้างตัวละคร
2. **แบบไม่มีหูจับ ตัดพอดีตัว** (ยังไม่มี — ต้องขอเพิ่มอีก 8 ไฟล์ ชิ้นเดียวกันแค่ crop ใหม่ให้พอดีท่าโพสตัวละคร) — ใช้ overlay ตอน equip แทนแบบมีหูจับที่ใช้อยู่ตอนนี้

Q4 (ผ้าคลุม) ฝั่งถูกมี ~8 ตัวเลือก ฝั่งผิดมีแค่ 1 — ต้อง confirm ว่าตั้งใจ asymmetric แบบนี้จริง หรือ mockup ฝั่งผิดยังทำไม่ครบ

### 3.5 Start screen — mockup เต็มที่ได้รับมา (ตกแต่งรอบโลโก้)

Mockup ใหม่ (เต็มฉาก): แถบ header เรียบด้านบน (ไม่มีโลโก้/hamburger — ดูข้อ "Header variant" ด้านล่าง) + พื้นครีม + ของตกแต่งกระจายรอบโลโก้ตรงกลาง (บัตร ID, คลิปหนีบกระดาษหลายตัว, ดินสอ, ยางลบ, แก้วกาแฟ, ชุดนักเรียน/เสื้อ, ตุ๊กตาหมีโผล่มุมล่าง) + ปุ่ม START + แถบล่างสีน้ำตาลรูปหูหมี

**ของตกแต่งรอบโลโก้ (บัตร ID / คลิปหนีบ / ดินสอ / ยางลบ / แก้วกาแฟ / เสื้อ / ตุ๊กตาหมี)**
สไตล์เป็น flat illustration เส้นตัดชัด สีทึบ ไม่ใช่ painterly/gradient หนักแบบพื้นผิวกระดาษ — เข้าเกณฑ์ SVG ได้เลยถ้า designer วาดในโปรแกรม vector (Illustrator/Figma) อยู่แล้ว (เกือบทุกงาน flat cartoon แบบนี้เป็น vector source ตั้งแต่ต้น ไม่ใช่ painterly) → **ควรขอเป็น SVG** เพราะ:

- คมทุกขนาดจอ ไม่แตกเวลาจอใหญ่ (raster ขยายแล้วเบลอ)
- แยก entrance animation ทีละชิ้นได้ตรงตาม `StaggerRevealDirective` ที่วางแผนไว้ (ข้อ 9) — ทยอยบิน/หมุนเข้าเหมือนของหล่นบนโต๊ะ
- คลิปหนีบกระดาษที่ซ้ำกันหลายตัว (มุมต่างกัน) **ขอมาแบบเดียวพอ** แล้ว dev หมุน/ย่อ-ขยาย/จัดตำแหน่งเองด้วย CSS transform — ไม่ต้องให้ designer ทำแยกทุกมุม ประหยัดงาน design
- ตุ๊กตาหมี ถ้ามีขนสัตว์/shading ที่ต้อง gradient เยอะ (ต่างจากของชิ้นอื่นที่แบนสี) อาจต้องเป็น PNG โปร่งใสแทน — ให้ designer ส่งมาเป็น SVG ก่อน ถ้าทำไม่ได้ค่อย fallback PNG แยกชิ้นจากพื้นหลัง

**ปุ่ม START**
เดิม `start bg.webp` เป็นภาพ raster เดียว (pill + เส้นประ + ตัวอักษร "START" ฝังในภาพ) ตอนนี้แนะนำเปลี่ยนเป็น:

- Pill + เส้นประ → **SVG** (ใช้ `stroke-dasharray` ทำเส้นประจริงในโค้ด ไม่ต้อง raster) — ได้ทั้งความคมชัดทุกขนาด และทำ dash-offset "วาดกรอบ" ตอน entrance ได้ (ตาม §5 GSAP list)
- ตัวอักษร "START" → ถ้า designer มีไฟล์ font ที่ใช้ในโลโก้ (มันคือ custom rounded font เดียวกับ "TINY TRACKS") ให้ขอไฟล์ `.woff2` มาด้วย จะได้ใส่เป็น `<span>START</span>` จริงแทนการ bake เป็นภาพ — แก้ข้อความ/ทำหลายภาษาได้ในอนาคต (ตรงกับ Open Question ข้อ 8.9 ที่เคยตั้งไว้)
- ถ้าไม่มีไฟล์ font ให้ใช้ได้ (ติด license) → fallback เป็นภาพคำว่า "START" แยกชิ้นจาก pill (อย่างน้อยให้ pill เป็น SVG ปรับสี/ขนาดได้อิสระ)

**Footer แถบล่างสีน้ำตาล (เส้นมีหูหมี)**
รูปทรงเป็นแท่งแบนพาดเต็มความกว้างจอ มีปุ่มโค้งมนคล้ายหูหมีสองข้าง (ซ้าย-ขวา) โผล่ขึ้นมา — **แก้ไข: ไม่ใช่สีทึบล้วน มีลายไม้ (wood grain texture)** ดังนั้นไม่ใช่ SVG/CSS สีทึบเหมือนที่เข้าใจตอนแรก เพราะลายไม้เป็น texture ภาพถ่าย/painterly ไม่ใช่ flat vector shape — ต้องเป็น **raster (PNG/WebP)** ยังคงพาดเต็มจอทุกขนาดหน้าจอโดยไม่เบลอ/ไม่ยืดเพี้ยนตรงลายไม้ได้ด้วยเทคนิค "3-slice" เหมือนเดิม แค่เปลี่ยนวิธีทำส่วนกลาง:

1. ชิ้นหูหมี 1 ข้าง — raster (PNG/WebP โปร่งใส) ขอ designer มา 1 ไฟล์ ใช้ CSS `transform: scaleX(-1)` กลับด้านทำอีกข้าง ไม่ต้องขอ 2 ไฟล์
2. เส้นตรงกลาง — ขอ designer เป็น **wood-grain texture แบบ seamless tile** (ไฟล์ raster เล็กๆ ที่ต่อกันซ้ำแล้วไม่เห็นรอยต่อ เช่น 300×60px) แล้ว dev ใช้ CSS `background-repeat: repeat-x` ให้มันเรียงต่อกันเต็มความกว้างจอ — **ห้ามยืดภาพเดียว** (`preserveAspectRatio="none"` หรือ stretch) เพราะลายไม้จะเบลอ/บิดเบี้ยวเห็นชัดเจนเมื่อยืด ต้องเป็นการ "เรียงต่อ" (tile) ไม่ใช่ "ยืด" (stretch) — สีพื้นของลายไม้ตรงกลางกับหูหมีสองข้างต้องให้ designer ทำให้กลืนกัน (สี/เฉดใกล้เคียงกัน) ไม่งั้นจะเห็นรอยต่อระหว่างชิ้น

- ตุ๊กตาหมีที่โผล่พ้นแถบขึ้นมา (มี fur texture/shading) → แยกเป็นคนละ layer จากแถบ เก็บเป็น PNG โปร่งใส (ตามกฎ §3.1 ตัวละคร/ของมี shading เก็บ raster)

**Header ของหน้า Start**
ยืนยันแล้วว่า **ไม่ใช่ header เดียวกับหน้าอื่น** — หน้า Start ใช้ variant "เปล่า" (แถบสีพื้นล้วน ไม่มีโลโก้/hamburger/รอยหยักโค้งใดๆ) ส่วน header แบบเต็ม (โลโก้+รอยหยักโค้งจาก asset จริง+hamburger) ใช้ตั้งแต่หน้า Story เป็นต้นไป — **implement แล้ว**: เพิ่ม `bare` input ให้ `HeaderComponent` (`<app-header [bare]="true" />` ใน `StartComponent`) เมื่อ `bare` เป็น true จะไม่ render อะไรใน header เลยนอกจากแถบสีพื้น

> เคยลองทำ "เปล่า" ให้มีรอยเฉียง/หยักด้วย (`clip-path` diagonal) เข้าใจผิดว่าเป็น mockup ใหม่ที่ user ส่งมา — จริงๆ คือ screenshot จาก build เวอร์ชันที่ผิดของ dev เอง ไม่ใช่ reference ใหม่ **แก้ไขแล้ว**: bare กลับไปเป็นแถบเปล่าล้วนตามเดิม ส่วนรอยหยักโค้งจริงเอาไปใช้ในแถบเต็ม (§2.2) แทน — บทเรียน: เจอ screenshot ที่ไม่ชัดว่าเป็น reference ใหม่หรือ build ปัจจุบัน ให้เช็คกับ asset ต้นฉบับ (`หัว.webp`) ก่อนเดา

### 3.6 บั๊ก Safari กับ `filter: drop-shadow()` บน element ที่หมุน — เจอกับ decor บัตร ID แล้ว

**อาการ**: เงา (`filter: drop-shadow()`) ของ `id-card` (บัตรที่หมุน `rotate(-16deg)`) โดนตัดเป็นกรอบสี่เหลี่ยม **ที่ไม่หมุนตามบัตร** (กรอบค้างอยู่ตามแนวจอ) — เกิดเฉพาะ Safari (macOS และ iOS ทั้งคู่) Chrome ปกติดี

**สาเหตุจริง**: Safari/WebKit คำนวณพื้นที่ render ของ `filter` เป็นกล่องแบบไม่หมุนตาม ancestor ที่มี `transform: rotate()` — ไม่ว่า `filter` กับ `rotate` จะอยู่ element เดียวกันหรือแยกเป็น parent/child ก็ยังเป็นปัญหาเดิม (**แยก element ไม่ช่วย** ต่างจากที่คนแนะนำกันทั่วไปสำหรับบั๊ก Safari filter อีกแบบหนึ่ง)

**สิ่งที่ลองแล้วไม่เวิค** (เรียงตามลำดับที่ลอง): แยก `rotate`(wrapper)/`filter`(img) คนละ element, ใส่ `width`/`height`/`aspect-ratio` ชัดเจน, `transform: translateZ(0)`, `will-change: filter, transform`, เอา `overflow: hidden` ของ parent ออก, เพิ่มระยะห่างจาก header (เผื่อโดน z-index สูงกว่าบัง)

**ทางแก้ที่ใช้ได้จริง (confirm แล้วบน Safari)**: เลิกใช้ CSS `filter`/`transform` แบบ live กับรูปนี้ทั้งหมด — **bake การหมุน + เงาลงในตัวไฟล์ภาพเอง** ด้วย image processing (หมุน pixel จริง + composite เงานุ่มจาก alpha channel ของภาพ) ได้เป็นไฟล์แบนไฟล์เดียว ไม่มี live filter ให้ browser คำนวณอีก ไฟล์ตัวอย่าง: `public/assets/images/start/decor/id-card-decor.webp`

**ข้อจำกัดสำคัญ — bake ใช้กับ SVG ไม่ได้ตรงๆ**: bake เป็นเทคนิค raster (pixel) ล้วนๆ ถ้าของตกแต่งชิ้นต่อไปได้มาเป็น **SVG** (ตามแผน §3.5 ที่อยากได้ SVG เพื่อความคมชัด+ปรับสีได้) เอามา bake ทิ้งจะเสียจุดเด่นของ SVG ไปหมด — **แผนสำหรับของตกแต่งที่เป็น SVG**: ลองใช้ `<feDropShadow>` ของ SVG เอง (shadow + rotate ทำเป็นส่วนหนึ่งของไฟล์ SVG/inline SVG ไปเลย ไม่ใช่ CSS จากภายนอก) เพราะเป็นคนละ render pipeline กับ CSS `filter`+`transform` บน `<img>` ที่เจอบั๊ก น่าจะรอด — **ยังไม่เคยเทสจริง รอไฟล์ SVG มาก่อนถึงจะลองได้** ถ้าเจอบั๊กแบบเดียวกันอีก ให้ fallback ไปทาง rasterize+bake (รู้แล้วว่าเวิคแน่ๆ) หรือตัดเงาออกไปเลยก็ได้ (ของจริงจาก design ไม่ได้มีเงาด้วยซ้ำ — เงาเป็นสิ่งที่ dev เพิ่มเอง)

---

## 4. Interaction ต่อ Question

| Question | Interaction                                       | รายละเอียด                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1       | Swipe/เลื่อนการ์ดแบบโพสต์ IG                      | ตัวเลือกทั้งหมด 4 รูป (เลื่อนดูด้วยปุ่มลูกศร ◀▶), มี 2 รูปที่นับเป็นคำตอบถูก — เลือกข้อไหนก็ได้ในสองข้อนั้นแล้วกด POST ยืนยัน ก็ถือว่าตอบถูก (confirm 2026-08-16)                                                             |
| Q2       | คำถาม + ช้อยให้ติกเลือกคำตอบ                      | ยังไม่มี visual mockup (เลย์เอาต์/จำนวนช้อย/การ์ดหรือลิสต์) — ใช้ `QuestionMultipleChoiceComponent` แบบ data-driven (options เป็น array ใน `QuestionConfig`) ไปก่อน รอดีไซน์มา swap เลย์เอาต์ทีหลังได้โดยไม่กระทบ state/logic |
| Q3       | คำถาม + ช้อยให้ติกเลือกคำตอบ                      | เหมือน Q2                                                                                                                                                                                                                     |
| Q4       | เลือกผ้าคลุม → ดึงเข้ามาคลุมตัวละคร               | เลือกแล้วต้องกดปุ่มยืนยันก่อน ถึงจะกด Next ได้ (confirm 2026-08-16), ใช้ `CharacterStageComponent` overlay ผ้าคลุม                                                                                                            |
| Q5       | คลิกไอเทมจากกริดรอบตัวละคร equip แบบ live preview | เสื้อท่อนบน/กางเกง-กระโปรงท่อนล่างแยกกริด ใส่สลับตำแหน่งไม่ได้ (เสื้อใส่บนอย่างเดียว, กางเกง/กระโปรงใส่ล่างอย่างเดียว) มีคู่คำตอบถูก 4 คู่ แนะนำเพิ่มปุ่ม POST/ยืนยันแบบเดียวกับ Q1 เพื่อความสม่ำเสมอ                        |
| Q6       | คำถาม + ช้อยให้ติกเลือกคำตอบ                      | เหมือน Q2/Q3 — ยังไม่ได้คุยรายละเอียด (ดูข้อ 8)                                                                                                                                                                                |

**ไม่มีเฉลยระหว่างเล่น** — ทุกข้อแค่บันทึกคำตอบเข้า `QuizStateService` แล้วไปข้อถัดไป ไม่มี error state/ตัวบอกถูกผิดให้เห็นจนกว่าจะถึงหน้า `/result` (confirm 2026-08-16)

### 4.1 `QuestionMultipleChoiceComponent` (Q2/Q3/Q6) — สิ่งที่ล็อกได้แล้ว vs ยังรอดีไซน์

**ล็อกได้แล้ว** (ไม่ต้องรอ mockup ก็เริ่มเขียนได้):

- โครงสร้าง `QuestionConfig.options: { id, label, value, isCorrect }[]` — data-driven เหมือน Q1/Q4/Q5
- ปุ่มติก/เลือกใช้ pattern เดียวกับ checkbox ใน Q1 (คลิกแล้วเปลี่ยน state ทันที ไม่มี swipe/drag)
- ใช้ `AppHeaderComponent` + `StickyNoteButtonComponent` (ปุ่มยืนยัน/ถัดไป) เหมือนหน้าอื่น เพื่อความสม่ำเสมอ

**ยังต้องรอ designer confirm** (ไม่กระทบ state/logic แค่กระทบหน้าตา — ใส่ทีหลังได้):

- เลย์เอาต์ช้อย: การ์ดเรียงแนวตั้ง / กริด 2 คอลัมน์ / ปุ่มยาวเต็มความกว้าง
- เลือกได้กี่ข้อ: single-select (เหมือน radio, ตอบได้ 1) หรือ multi-select (ติกได้หลายข้อ) — "ติก" ในคำที่ user ใช้ชวนคิดว่าเป็น checkbox/multi-select แต่ต้อง confirm ก่อนเขียน validation
- ธีมภาพ/ไอคอนประกอบแต่ละช้อย (มีรูปประกอบเหมือน Q1 หรือเป็น text ล้วน)

---

## 5. CSS vs GSAP — เกณฑ์แบ่ง

**ใช้ CSS** เมื่อ: elements เดียว, property เดียว/สองอย่าง, ไม่ต้อง sequence/reverse ระหว่างทาง

- hover/press ปุ่ม (scale 0.97, สีเปลี่ยน)
- sticky-note button "หายใจ" เบาๆ (rotate ±1deg loop)
- fade toggle ง่ายๆ (backdrop modal)
- responsive layout ทั้งหมด (grid/flex ล้วนๆ ไม่มี animation lib เกี่ยวข้อง)

**ใช้ GSAP** เมื่อ: หลาย element ต้อง stagger/sequence, ต้อง interrupt/reverse ได้, หรือ driven by dynamic data (เช่น ตำแหน่งคลิก):

- ฉาก "ของบนโต๊ะ" ใน Story/Home entrance (stagger ทยอยเข้า พร้อม rotate เล็กน้อยให้ดูเหมือนโยนลงโต๊ะ)
- เปิด/ปิด zoom overlay (scale+fade จากตำแหน่งไอคอนที่คลิก, ใช้ FLIP-style transform-origin)
- Q1 swipe card transition ระหว่าง 2 ตัวเลือก
- Q4 texture carousel เลื่อนขึ้น/ลง
- Q5 equip animation (เสื้อผ้า fade/scale ลงตัวละคร)
- transition สรุปผล → ข้อควรปฏิบัติ (folder เปิด, ลูกศรเด้งวนลูป)
- page transition หลักทุกหน้า (ข้อ 6)
- side drawer เปิด/ปิดแบบ tab ทยอย cascade

---

## 6. Page Transition

แนะนำ **ไม่ใช้ Angular Router animation hook โดยตรง** (ควบคุม timing ยาก) — ทำ `PageTransitionService` กลางที่ทุกหน้าต้องเรียกผ่านจุดเดียว แล้วให้ router แค่ swap component หลัง exit-animation จบ (deferred activation)

รูปแบบ transition แยกตามช่วง:

| จาก → ไป                                  | ทรานซิชัน                                   | เหตุผล                           |
| ----------------------------------------- | ------------------------------------------- | -------------------------------- |
| Start → Story                             | cross-fade bg + ปุ่ม START ขยายทะลุจอ       | โมเมนต์เปิดเรื่อง                |
| Story: clip → เนื้อเรื่อง                 | slide-up (bottom sheet feel)                | เข้าธีม "สบายๆ" ของปุ่ม SKIP     |
| Story → Question 1                        | slide-left + rotate เบาๆ (พลิกหน้ากระดาษ)   | ตรงธีมกระดาษ/โต๊ะทำงาน           |
| Question → Question                       | slide-left สม่ำเสมอ (เหมือนเลื่อน carousel) | ให้ความรู้สึก progress ต่อเนื่อง |
| Q6 → สรุปผล                               | wipe/scale-punch แรงกว่าอันอื่น             | เป็นโมเมนต์เฉลย ต้องเด่น         |
| สรุปผล → ข้อควรปฏิบัติ/PhotoBooth/Concept | folder-open motif (จาก `แฟ้ม.webp`)         | เนื้อหาดูเหมือน "หยิบออกจากแฟ้ม" |

ทุก transition เรียกผ่าน `pageTransitionService.transitionTo(type, opts)` เดียว ไม่เขียน timeline ซ้ำในแต่ละ component

---

## 7. State ของคำตอบ (อัปเดต 2026-08-16 — เปลี่ยนจากแผนเดิมทั้งชุด)

### ตัดสินใจสำคัญ: **ไม่ persist state เลย** (ไม่ใช้ sessionStorage อีกต่อไป)

แผนเดิมเคยบอกว่าจะ persist ลง `sessionStorage` กัน refresh กลางเกมแล้วข้อมูลหาย — **ยกเลิกแล้ว** หลังคุยกับ user ตรงๆ เหตุผล:

- Persist-then-resume ต้องมี logic เยอะกว่ามาก: serialize ทุกครั้งที่ตอบ, ต้อง hydrate state **ก่อน** route activate (ไม่งั้นจะเห็นหน้าเปล่าแวบก่อนข้อมูลเก่าโผล่), และหนักสุดคือทุก sub-widget (swipe card, texture picker, outfit picker) ต้องรองรับ "ตั้งค่าเริ่มต้นจากคำตอบเก่า" เอง — งานเพิ่มทุก component ไม่ใช่แค่ระดับ service
- จุดประสงค์เว็บคือโชว์ design/interactive ไม่ใช่แอปที่ต้องกันข้อมูลหาย — ผู้เล่นเว็บแนว interactive story/campaign microsite แบบนี้คุ้นเคยอยู่แล้วว่า refresh = เริ่มใหม่

### ผลคือ: refresh ระหว่าง `/question/:id` หรือ `/result` = เด้งกลับ `/` (Start) เสมอ โดยไม่ต้องเขียน logic ดัก "นี่คือ refresh" เลย

กลไก — `hasEntered` flag ใน memory ล้วนๆ:

```ts
@Injectable({ providedIn: 'root' })
export class QuizStateService {
  readonly hasEntered = signal(false); // true เฉพาะตอนกดเข้าจาก HOME ถูกทาง
  private readonly answers = signal<Partial<Record<QuestionId, QuestionAnswer>>>({});

  enterQuiz(): void {
    this.hasEntered.set(true);
  }

  recordAnswer(id: QuestionId, value: AnswerValue, isCorrect: boolean): void { ... }
  getAnswer(id: QuestionId): QuestionAnswer | undefined { ... }
  readonly allAnswers = computed(() => this.answers());

  reset(): void {
    this.answers.set({});
    this.hasEntered.set(false);
  }
}
```

เพราะ `hasEntered` อยู่ใน memory ล้วนๆ (ไม่ persist) — **refresh เต็มหน้า = แอป bootstrap ใหม่ = `hasEntered` กลับเป็น `false` เอง โดยอัตโนมัติ** ไม่ต้องมี logic พิเศษตรวจจับว่า "นี่คือการ refresh" เลย

`quizGuard` (functional `CanActivateFn`) ติดไว้ที่ทุก route `/question/:id` และ `/result` — ถ้า `hasEntered()` เป็น `false` ก็ `router.parseUrl('/')` (redirect ไป Start) ครอบคลุมทั้ง refresh และการพิมพ์ URL ตรงเข้ามาดื้อๆ ด้วยกลไกเดียวกัน

`HomeComponent` เรียก `quizState.enterQuiz()` ตอนกดปุ่ม "อ่านสัญญา" (เดิมเป็น stub `readContract()` เปล่าๆ — ตอนนี้คือจุดเริ่มต้นของ quiz จริง) ก่อน navigate ไป `/question/1`

### Navigation ภายใน quiz

- **Back จาก Q1** → ไป `/home` **และ** `quizState.reset()` (ล้างคำตอบทั้งหมด + `hasEntered` กลับ false)
- **Back จาก Q2-Q6** → ไปข้อก่อนหน้า คำตอบเดิมยังอยู่ใน state แก้ไขใหม่ได้ (sub-widget อ่านค่าเก่าจาก `getAnswer()` มาตั้งเป็นค่าเริ่มต้นตอน mount)
- **Next** → `recordAnswer()` บันทึกคำตอบ+ถูกผิด แล้วไปข้อถัดไป (Q6 → `/result`)

---

## 8. Open Questions — ต้องถาม designer/PM ก่อนเริ่มเขียนโค้ดจริง

1. ~~กติกาคำนวณสรุปผล 1 vs 2~~ — **ตอบแล้ว 2026-08-16**: ไม่มีแตกสายอีกต่อไป เล่นครบ 6 ข้อเสมอ หน้า `/result` แสดง recap ถูก/ผิดรายข้อ (ดูข้อ 1 และข้อ 7)
2. สีเขียว/แดงใน mockup เป็น **annotation สำหรับ dev เท่านั้น** ใช่ไหม (ไม่ใช่ UI จริงที่ผู้เล่นเห็น)
3. Q2, Q3, Q6 confirm แล้วว่าเป็น "คำถาม + ช้อยให้ติก" (multiple choice) — เริ่มเขียน `QuestionMultipleChoiceComponent` แบบ data-driven ได้เลย (ดูข้อ 4.1) แต่ยังต้องรอ designer เรื่อง: เลือกได้ข้อเดียวหรือหลายข้อ (single vs multi-select), เลย์เอาต์การ์ด/กริด, มีรูปประกอบช้อยไหม
4. **STORY vs HOME** — จาก 02.png เห็นแค่ฉากเดียวก่อนเข้า Q1 (เนื้อเรื่อง+ซูมเอกสาร) ไม่เห็นหน้า HOME แยก คือ HOME ใช้ template เดียวกับ Story เปลี่ยนแค่เนื้อหา หรือเป็นคนละหน้าจริงๆ?
5. Q4: ฝั่ง "ถูก" มีผ้า ~8 ลาย ฝั่ง "ผิด" มีแค่ 1 — ตั้งใจ asymmetric จริงไหม
6. ~~Q5: ระบบเปลี่ยนชุดเป็น layer-swap หรือ full-character redraw~~ — **ตอบแล้ว 2026-08-16**: layer-swap, implement แล้ว (ดูข้อ 3.4)
7. PHOTO BOOTH และ CONCEPT ยังไม่มี mockup เลย — ต้องได้ดีไซน์ก่อนเริ่ม
8. หน้า "คลิป" (วิดีโอ) ใน Story เป็นไฟล์วิดีโอจริง (mp4) หรือ animated sequence ที่ทำเอง — ต้องรู้ format
9. ข้อความในเอกสารที่ซูม (เช่น `thesif ele-03.webp`) ปัจจุบัน bake เป็นภาพ — ถ้าต้องแก้ข้อความ/ทำหลายภาษาในอนาคต ควรแยกเป็น HTML text overlay บนพื้นกระดาษเปล่าแทนไหม

---

## 9. Reusable Animation Utility/Service ที่ควรสร้างตั้งแต่ต้น

1. **`GsapAnimationService`** — wrap การสร้าง `gsap.timeline()`, เก็บ registry ของ timeline ที่ active เพื่อ `kill()` ตอน component destroy (กัน memory leak), เช็ก `ReducedMotionService` ก่อนรันทุกครั้ง
2. **`PageTransitionService`** — จุดเดียวสำหรับทุก transition ระหว่างหน้า (ข้อ 6)
3. **`StaggerRevealDirective`** (`appStaggerReveal`) — ติดที่ container แล้ว auto-stagger fade+slide-up ให้ children โดยไม่ต้องเขียน timeline มือทุกหน้า (ใช้กับฉากโต๊ะทำงาน, กริดเสื้อผ้า Q5)
4. **Swipe/Drag directive** (GSAP Draggable หรือ Angular CDK drag + GSAP easing สำหรับ snap-back) — ใช้ร่วมกันทั้ง Q1 (card) และ Q4 (texture carousel) แทนเขียนแยก 2 ที่
5. **`ZoomOverlayService`** — เปิด modal ซูมแบบคำนวณ transform-origin จากตำแหน่งไอคอนที่คลิกจริง (FLIP-style) ใช้ได้ทั้ง Story doc-zoom และจุดอื่นในอนาคต
6. **`ReducedMotionService`** — เช็ก `prefers-reduced-motion` แต่แรก ให้ animation service อื่นทุกตัวอ่านค่านี้ก่อนรัน (accessibility ควรมีตั้งแต่ day 1 ไม่ใช่แปะทีหลัง)

---

## 10. Asset Checklist ที่ต้องขอ designer เพิ่ม (สรุปจากข้อ 3)

- [ ] Q2, Q3, Q6 — visual mockup ของ "คำถาม + ช้อยให้ติก" (เลย์เอาต์ช้อย, single/multi-select, รูปประกอบช้อยถ้ามี)
- [ ] Start scene decorations เป็น **SVG** แยกชิ้น: บัตร ID, คลิปหนีบกระดาษ (1 แบบพอ), ดินสอ, ยางลบ, แก้วกาแฟ, เสื้อ/ชุดนักเรียน (ตุ๊กตาหมี fallback PNG ถ้ามี shading เยอะ) — ดูข้อ 3.5
- [ ] ปุ่ม START เป็น SVG (pill + เส้นประ) แยกจากตัวอักษร + ไฟล์ web font (`.woff2`) ของฟอนต์ที่ใช้ใน "START"/โลโก้ ถ้าให้ได้ — ดูข้อ 3.5
- [ ] Footer แถบล่างหูหมี — raster 2 ชิ้น: (1) หูหมี 1 ข้าง PNG/WebP โปร่งใส (2) wood-grain texture แบบ seamless tile สำหรับเส้นกลาง (ใช้ CSS `background-repeat: repeat-x` ไม่ใช่ยืดภาพ) — ดูข้อ 3.5
- [ ] PHOTO BOOTH, HOME (ถ้าแยกจาก Story จริง) — mockup
- [ ] CONCEPT — mockup
- [ ] ฉาก "โต๊ะทำงาน" (`home.png` / `แฟ้ม.webp`) — แยกเลเยอร์ต่อชิ้น พื้นหลังโปร่งใส (ดูรายการข้อ 3.3)
- [x] ตัวละคร Q5 — ได้ asset จริงแล้ว ใช้งานอยู่ (ดูข้อ 3.4) — [ ] ยังขอเสื้อผ้า Q5 อีก 8 ไฟล์ เวอร์ชัน "fit ตัวละคร" (ตัดหูจับออก, crop พอดีท่าโพส `character-frame.webp`) แยกจาก 8 ไฟล์เดิมที่ใช้โชว์กริด (ดูข้อ 3.4.1)
- [ ] ตัวละคร Q4 — export ตามแบบที่ confirm แล้ว (layer-swap, ดูข้อ 3.4)
- [x] ไอคอน hamburger — แยกเป็น SVG แล้ว (ดู §2.2)
- [ ] close (X), แว่นขยาย, ลูกศรทุกทิศ — SVG แยกจากพื้นหลัง (ปัจจุบัน bake ในภาพ)
- [ ] ลายตารางไม้หมากรุกมุมจอ — seamless tile version
- [ ] `file 2.webp`, `file 3.webp`, `file 4.webp`, `file 5.webp`, `file 6.webp` ของข้อควรปฏิบัติ (ตอนนี้มีไม่ครบ/ใช้ไฟล์ร่วมกันบางเบอร์) — ตรวจว่าครบ 6-7 ใบจริงหรือยัง

---

## Development Setup

- Package manager: **pnpm**
- Angular 19 standalone components, Signals-based state — scaffold แล้วด้วย `ng new --directory=. --style=scss --routing --ssr=false`
- Asset folder เป็น Angular 19 default คือ `public/assets/images/...` (ไม่ใช่ `src/assets/`) — copy จาก `/Users/nongtub/Downloads/tiny tracks web/element/` เข้ามาทีละไฟล์ตามต้องใช้จริง ไม่ copy ยกโฟลเดอร์
- GSAP (+ Draggable plugin ตามต้องการ) — core only, ไม่ใช้ ScrollTrigger เพราะดีไซน์ปัจจุบันไม่มี scroll-driven effect — ติดตั้งแล้ว (`pnpm add gsap`) ยังไม่ได้เริ่มใช้จริง
- Dev server รันที่ port **4300** ไม่ใช่ 4200 (4200 ชนกับ project อื่นในเครื่อง) — ดู `.claude/launch.json`
- **Tailwind CSS v4** ติดตั้งแล้ว (`pnpm add -D tailwindcss @tailwindcss/postcss postcss`) — setup แบบ CSS-first ของ v4 ไม่มี `tailwind.config.js`:
  - `.postcssrc.json` เปิดใช้ `@tailwindcss/postcss` plugin
  - `src/tailwind.css` มีแค่ `@import "tailwindcss";` — เป็นไฟล์ `.css` เปล่าๆ ไม่ใช่ `.scss` เพราะ Tailwind v4 ใช้ CSS syntax ใหม่ (`@property`, nested `@layer`) ที่ Sass compiler อ่านไม่ผ่าน ต้องแยกออกจาก `styles.scss`
  - `angular.json` เพิ่ม `src/tailwind.css` ไว้**ก่อน** `src/styles.scss` ใน `styles[]` (ทั้ง `build` และ `test` target) ให้ Tailwind base/reset โหลดก่อน แล้ว custom global styles ของเราทับทีหลัง
  - **Convention: Hybrid** — ใช้ Tailwind utility class ใน HTML สำหรับ layout ทั่วไป (flex/gap/grid/spacing เช่นหน้า Q2/Q3/Q6 ที่เป็น list ธรรมดา) ส่วน SCSS ต่อ component ยังคงไว้สำหรับจุดที่ผูกกับ asset/ดีไซน์เฉพาะ (header curve, ตำแหน่งของตกแต่งที่ scatter/หมุน, สี custom property) — เหตุผล: งานหลักของเว็บนี้เป็น custom visual ที่ Tailwind utility ช่วยไม่ได้มาก แต่ layout ทั่วไปใช้ Tailwind ลด boilerplate ได้
