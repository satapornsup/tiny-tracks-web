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
    interactionType: 'placeholder',
    prompt: 'แต่งตัวตัวละคร (ยังไม่ได้สร้าง)',
  },
  {
    id: 6,
    interactionType: 'placeholder',
    prompt: 'คำถามข้อ 6 (ยังไม่ได้ออกแบบ)',
  },
] as const;
