import { QuestionConfig } from './question.types';

/* Q1 options use dummy placeholder art (element/Q1/Q1_C1-4.png) until real
   photo assets exist — swap `image` once designer delivers final art; the
   swipe-card mechanic itself doesn't change. */
export const QUESTIONS: readonly QuestionConfig[] = [
  {
    id: 1,
    interactionType: 'swipe-card',
    prompt: 'สัญญาข้อที่ 1 เลือกภาพเพื่ออัพโหลดภาพมูลี่วันละ 1 โพส',
    options: [
      {
        id: 'a',
        label: 'ตัวเลือก 1',
        image: 'assets/images/question/q1/Q1_C1.webp',
        isCorrect: true,
      },
      {
        id: 'b',
        label: 'ตัวเลือก 2',
        image: 'assets/images/question/q1/Q1_C2.webp',
        isCorrect: false,
      },
      {
        id: 'c',
        label: 'ตัวเลือก 3',
        image: 'assets/images/question/q1/Q1_C3.webp',
        isCorrect: true,
      },
      {
        id: 'd',
        label: 'ตัวเลือก 4',
        image: 'assets/images/question/q1/Q1_C4.webp',
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    interactionType: 'privacy-reveal',
    prompt: 'สัญญาข้อที่ 2 ต้องเปิดเผยข้อมูลส่วนตัวต่อสาธารณะ',
  },
  {
    id: 3,
    interactionType: 'work-clock',
    prompt: 'สัญญาข้อที่ 3 เลือกรับงานให้กับมู่ลี่',
    /* each offer is its own independent toggle, not a single choice among
       4 — the reference mockup (aคำถาม3.png) only has the short daytime
       gig switched on; the other three (overnight, or oddly high-paying
       for the hours) are correctly off */
    workOffers: [
      {
        id: 'overnight',
        amount: '20,000 บาท',
        timeRange: '23.00 น. - 24.00 น.',
        isCorrectOn: false,
        corner: 'top-left',
      },
      {
        id: 'daytime-short',
        amount: '1,500 บาท',
        timeRange: '13.00 น. - 13.20 น.',
        isCorrectOn: true,
        corner: 'top-right',
      },
      {
        id: 'evening',
        amount: '13,000 บาท',
        timeRange: '20.00 น. - 21.50 น.',
        isCorrectOn: false,
        corner: 'bottom-left',
      },
      {
        id: 'late-afternoon',
        amount: '1,900 บาท',
        timeRange: '17.00 น. - 17.30 น.',
        isCorrectOn: false,
        corner: 'bottom-right',
      },
    ],
  },
  {
    id: 4,
    interactionType: 'outfit-picker',
    prompt: 'สัญญาข้อที่ 4 แต่งตัวให้ลูกของคุณเพื่อไปถ่ายคลิปโปรโมทสินค้า',
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
    id: 5,
    interactionType: 'curtain',
    prompt: 'สัญญาข้อที่ 5 มีผู้คนจับจ้องตลอดเนื่องจากเป็นบุคคลสาธารณะ',
  },
  {
    id: 6,
    interactionType: 'placeholder',
    prompt: 'คำถามข้อ 6 (ยังไม่ได้ออกแบบ)',
  },
] as const;
