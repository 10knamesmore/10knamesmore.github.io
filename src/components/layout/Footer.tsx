import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {currentYear} 王二的博客. All rights reserved.</p>
        <p className="footer-subtitle">Built with React & TypeScript</p>
      </div>
    </footer>
  );
};

export default Footer;
