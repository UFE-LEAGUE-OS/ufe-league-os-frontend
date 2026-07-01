import './SportCategories.css';
import footballImg from '../assets/football-card.png';
import rugbyImg from '../assets/rugby-card.png';
import basketballImg from '../assets/basketball-card.png';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const categories = [
  {
    title: 'From the local pitch to the big stage.',
    button: 'Explore Football',
    gradient: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
    fadeColor: '#1E3A8A',
    image: footballImg,
    route: '/sports/football',
  },
  {
    title: 'Stronger together. United by rugby.',
    button: 'Explore Rugby',
    gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    fadeColor: '#4C1D95',
    image: rugbyImg,
    route: '/sports/rugby',
  },
  {
    title: 'Fast breaks. Big plays. Loyal fans.',
    button: 'Explore Basketball',
    gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
    fadeColor: '#C2410C',
    image: basketballImg,
    route: '/sports/basketball',
  },
];

function SportCategories() {
  const navigate = useNavigate();

  return (
    <section className="sport-categories">
      {categories.map((cat) => (
        <div
          className="category-card"
          style={{ background: cat.gradient }}
          key={cat.title}
          onClick={() => navigate(cat.route)}
        >
          <div
            className="category-image"
            style={{ '--card-bg': cat.fadeColor } as React.CSSProperties}
          >
            <img src={cat.image} alt={cat.button} />
          </div>
          <div className="category-text">
            <p>{cat.title}</p>
            <button
              className="category-btn"
              onClick={(e) => { e.stopPropagation(); navigate(cat.route); }}
            >
              {cat.button}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default SportCategories;
