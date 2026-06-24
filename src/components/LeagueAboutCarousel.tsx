import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './LeagueAboutCarousel.css';

interface AboutItem {
  title: string;
  description: string;
}

interface Props {
  items: AboutItem[];
  leagueName: string;
}

export default function LeagueAboutCarousel({ items, leagueName }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  if (items.length === 0) return null;

  return (
    <div className="league-about-carousel-section">
      <div className="league-about-carousel-content">
        <h2>About the {leagueName}</h2>
        <div
          className="league-about-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Previous">
            <FiChevronLeft size={22} />
          </button>

          <div className="carousel-track-wrapper">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {items.map((item, idx) => (
                <div className="carousel-slide" key={idx}>
                  <div className="carousel-card">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Next">
            <FiChevronRight size={22} />
          </button>
        </div>

        <div className="carousel-dots">
          {items.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${idx === current ? 'active' : ''}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}