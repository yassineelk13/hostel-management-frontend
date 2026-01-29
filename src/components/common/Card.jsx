const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-large' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
