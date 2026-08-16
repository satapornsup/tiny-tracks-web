import { QuestionConfig } from './question.types';

/* Q1 options use dummy placeholder art (element/Q1/Q1_C1-4.png) until real
   photo assets exist — swap `image` once designer delivers final art; the
   swipe-card mechanic itself doesn't change. */
export const QUESTIONS: readonly QuestionConfig[] = [
  {
    id: 1,
    interactionType: 'swipe-card',
    prompt: 'เลือกรูปที่ปลอดภัยสำหรับมู่ลี่',
    options: [
      {
        id: 'a',
        label: 'ตัวเลือก 1',
        image: 'assets/images/question/q1/Q1_C1.png',
        isCorrect: true,
      },
      {
        id: 'b',
        label: 'ตัวเลือก 2',
        image: 'assets/images/question/q1/Q1_C2.png',
        isCorrect: false,
      },
      {
        id: 'c',
        label: 'ตัวเลือก 3',
        image: 'assets/images/question/q1/Q1_C3.png',
        isCorrect: false,
      },
      {
        id: 'd',
        label: 'ตัวเลือก 4',
        image: 'assets/images/question/q1/Q1_C4.png',
        isCorrect: true,
      },
    ],
  },
  {
    id: 2,
    interactionType: 'placeholder',
    prompt: 'คำถามข้อ 2 (ยังไม่ได้ออกแบบ)',
  },
  {
    id: 3,
    interactionType: 'placeholder',
    prompt: 'คำถามข้อ 3 (ยังไม่ได้ออกแบบ)',
  },
  {
    id: 4,
    interactionType: 'placeholder',
    prompt: 'ปิดม่านตัวละคร (ยังไม่ได้สร้าง)',
  },
  {
    id: 5,
    interactionType: 'outfit-picker',
    prompt: 'แต่งตัวให้ลูกของคุณเพื่อไปถ่ายคลิปโปรโมทสินค้า',
    /* 4 tops × 4 bottoms, 2 of each correct (blouse/striped-bow tops,
       fur-shorts/striped-pants bottoms) — any correct-top + correct-bottom
       combo counts as correct, matching the 4 confirmed answer pairs.
       column/order here mirrors the design mockup's fixed thumbnail
       layout exactly (verified against each rendered SVG one by one —
       the source filenames don't correspond to their visual content in
       any obvious order). */
    items: [
      {
        id: 'top-fur-wrap',
        image: 'assets/images/question/q5/top-fur-wrap.svg',
        type: 'top',
        column: 'left',
        isCorrect: false,
      },
      {
        id: 'top-blouse-gray',
        image: 'assets/images/question/q5/top-blouse-gray.svg',
        type: 'top',
        column: 'left',
        isCorrect: true,
      },
      {
        id: 'bottom-striped-pants',
        image: 'assets/images/question/q5/bottom-striped-pants.svg',
        type: 'bottom',
        column: 'left',
        isCorrect: true,
      },
      {
        id: 'bottom-skirt-pink',
        image: 'assets/images/question/q5/bottom-skirt-pink.svg',
        type: 'bottom',
        column: 'left',
        isCorrect: false,
      },
      {
        id: 'top-striped-bow',
        image: 'assets/images/question/q5/top-striped-bow.svg',
        type: 'top',
        column: 'right',
        isCorrect: true,
      },
      {
        id: 'top-bikini-pink',
        image: 'assets/images/question/q5/top-bikini-pink.svg',
        type: 'top',
        column: 'right',
        isCorrect: false,
      },
      {
        id: 'bottom-fur-shorts',
        image: 'assets/images/question/q5/bottom-fur-shorts.svg',
        type: 'bottom',
        column: 'right',
        isCorrect: true,
      },
      {
        id: 'bottom-shorts-gray',
        image: 'assets/images/question/q5/bottom-shorts-gray.svg',
        type: 'bottom',
        column: 'right',
        isCorrect: false,
      },
    ],
  },
  {
    id: 6,
    interactionType: 'placeholder',
    prompt: 'คำถามข้อ 6 (ยังไม่ได้ออกแบบ)',
  },
] as const;
