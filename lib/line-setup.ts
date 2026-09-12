/**
 * ข้อความที่บอทส่งตอนถูกเชิญเข้ากลุ่ม (หรือตอนถูกถามด้วย "groupid")
 * บอกทั้ง id และสถานะว่ากลุ่มนี้ถูกตั้งเป็นปลายทางอยู่แล้วหรือยัง
 * เพื่อให้ยืนยันได้ว่าตั้งค่าสำเร็จโดยไม่ต้องไปเปิดดูที่โฮสต์
 */
export function setupMessage(target: { kind: string; id: string }): string {
  const configured = process.env.LINE_GROUP_ID;
  const head = `${target.kind} ของแชทนี้คือ\n${target.id}`;

  if (!configured) {
    return (
      `${head}\n\n` +
      'ยังไม่ได้ตั้งค่าปลายทาง — นำ id ด้านบนไปใส่เป็น LINE_GROUP_ID บนโฮสต์ ' +
      'แล้ว deploy อีกครั้ง คำขอใบเสนอราคาจากเว็บไซต์จะถูกส่งเข้ามาที่นี่'
    );
  }
  if (configured === target.id) {
    return `${head}\n\nตั้งค่าไว้แล้ว พร้อมรับคำขอใบเสนอราคาจากเว็บไซต์`;
  }
  return (
    `${head}\n\n` +
    'ขณะนี้ระบบส่งคำขอเข้าอีกแชทหนึ่งอยู่ ถ้าต้องการย้ายมาที่นี่ ' +
    'ให้แก้ LINE_GROUP_ID บนโฮสต์เป็น id ด้านบน แล้ว deploy อีกครั้ง'
  );
}
