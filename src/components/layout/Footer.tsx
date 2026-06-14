export default function Footer() {
  const currentYear = new Date().getFullYear(); // 오늘 날짜에서 연도만 자동으로 가져옴

  return (
    <footer className="main-footer">
      <p>© {currentYear} GWON System Inc. All Rights Reserved.</p>
    </footer>
  );
}
