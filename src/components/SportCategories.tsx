import './SportCategories.css';

const categories = [
  {
    title: 'From the local pitch to the big stage.',
    button: 'Explore Football',
    gradient: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
    emoji: '⚽',
  },
  {
    title: 'Stringer together. United by rugby.',
    button: 'Explore Rugby',
    gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    emoji: '🏉',
  },
  {
    title: 'Fast breaks. Big plays. Loyal fans.',
    button: 'Explore Basketball',
    gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
    emoji: '🏀',
  },
];

function SportCategories() {
  return (
    <section className="sport-categories">
      {categories.map((cat) => (
        <div
          className="category-card"
          style={{ background: cat.gradient }}
          key={cat.title}
        >
          <div className="category-icon">{cat.emoji}</div>
          <div className="category-text">
            <p>{cat.title}</p>
            <button className="category-btn">{cat.button}</button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default SportCategories;