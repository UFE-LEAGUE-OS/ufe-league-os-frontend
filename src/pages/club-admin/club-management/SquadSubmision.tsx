import { useState } from "react";
import { Check, ChevronLeft, Send, CheckCircle2 } from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";


interface Player {
  id: number;
  clubId: number;
  name: string;
  position: string;
  status: "Active" | "Suspended" | "Injured";
}
interface Official {
  id: number;
  clubId: number;
  name: string;
  role: string;
}

const loggedInClub = {
  id: 1,
  name: "KCCA FC",
  sport: "Football",
};
const squadRules = {
  Football: {
    minimumPlayers: 2,
    maximumPlayers: 3,
  },

  Basketball: {
    minimumPlayers: 8,
    maximumPlayers: 12,
  },

  Rugby: {
    minimumPlayers: 23,
    maximumPlayers: 30,
  },
};
const currentSquadRule = squadRules[loggedInClub.sport as keyof typeof squadRules];
const competitions = ["Uganda Premier League", "National Cup"];

const fixturesByCompetition: Record<string, string[]> = {
  "Uganda Premier League": [`${loggedInClub.name} vs SC Villa`, "Express vs KCCA"],
  "National Cup": [`${loggedInClub.name} vs Vipers SC`, "URA vs Police FC"],
};

const playersData: Player[] = [

  {
    id: 1,
    clubId: 1,
    name: "John Okello",
    position: "Midfielder",
    status: "Active"
  },

  {
    id: 2,
    clubId: 1,
    name: "Allan Okello",
    position: "Forward",
    status: "Active"
  },

  {
    id: 3,
    clubId: 1,
    name: "David Peter",
    position: "Goalkeeper",
    status: "Injured"
  },

  {
    id: 4,
    clubId: 2,
    name: "Brian Kato",
    position: "Point Guard",
    status: "Active"
  }

];

const officialsData: Official[] = [
  { id: 1, clubId: 1, name: "John Doe", role: "Head Coach" },
  { id: 2, clubId: 1, name: "Sarah Namusoke", role: "Assistant Coach" },
  { id: 3, clubId: 1, name: "Peter Ojara", role: "Team Manager" },
  { id: 4, clubId: 2, name: "Other Coach", role: "Coach" },
];

const SquadSubmission = () => {
  const [step, setStep] = useState(1);
  const [competition, setCompetition] = useState(competitions[0]);
  const [fixture, setFixture] = useState(fixturesByCompetition[competitions[0]][0]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [selectedOfficials, setSelectedOfficials] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const clubPlayers = playersData.filter(
    (player) =>
      player.clubId === loggedInClub.id &&
      player.status === "Active"
  );
  const clubOfficials = officialsData.filter((official) => official.clubId === loggedInClub.id);

  const togglePlayer = (id: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleOfficial = (id: number) => {
    setSelectedOfficials((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCompetitionChange = (value: string) => {
    setCompetition(value);
    setFixture(fixturesByCompetition[value][0]);
  };

  const submitSquad = () => {
    setSubmitted(true);
    setSubmittedAt(new Date().toLocaleString());
  };

  const canGoNext = () => {

    if (step === 2) {

      return (
        selectedPlayers.length >= currentSquadRule.minimumPlayers &&
        selectedPlayers.length <= currentSquadRule.maximumPlayers
      );

    }


    if (step === 3) {

      return selectedOfficials.length > 0;

    }


    return true;

  };


  const handleNext = () => {

    if (step === 2) {

      if (selectedPlayers.length < currentSquadRule.minimumPlayers) {

        setValidationMessage(
          `Please select at least ${currentSquadRule.minimumPlayers} players before continuing.`
        );

        return;
      }


      if (selectedPlayers.length > currentSquadRule.maximumPlayers) {

        setValidationMessage(
          `You cannot select more than ${currentSquadRule.maximumPlayers} players.`
        );

        return;
      }
    }


    if (step === 3) {

      if (selectedOfficials.length === 0) {

        setValidationMessage(
          "Please select at least one official before continuing."
        );

        return;
      }
    }


    setValidationMessage(null);
    setStep(step + 1);
  };

  return (
    <div className="club-page">
        <div className="club-header">
          <div>
            <h1> {loggedInClub.name}  </h1>
            <p>
              {loggedInClub.sport}
            </p>
          </div>
        </div>

        <div className="stepper">
          {[1, 2, 3, 4, 5].map((number) => (
            <div key={number} className={step >= number ? "step active" : "step"}>
              <span>{step > number ? <Check size={16} /> : number}</span>
            </div>
          ))}
        </div>

        <div className="club-card submission-card">
          {step === 1 && (
            <div>
              <h4>Match Details</h4>

              <div className="form-grid">
                <select value={competition} onChange={(e) => handleCompetitionChange(e.target.value)}>
                  {competitions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <select value={fixture} onChange={(e) => setFixture(e.target.value)}>
                  {fixturesByCompetition[competition].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4>Select Players</h4>

              <p>
                Players registered under {loggedInClub.name}
              </p>

              <p className="rule-message">
                Required squad size:
                {currentSquadRule.minimumPlayers}
                -
                {currentSquadRule.maximumPlayers}
                players
              </p>

              <p className="selected-count">
                Selected Players:{" "}
                <strong>
                  {selectedPlayers.length}
                </strong>
                {" / "}
                {currentSquadRule.maximumPlayers}
                
              </p>


              <div className="selection-list">
                {clubPlayers.map((player) => (
                  <label key={player.id} className="selection-item">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                    />
                    <div>
                      <strong>
                        {player.name}
                      </strong>

                      <br />

                      <span>
                        {player.position}
                      </span>

                      <br />

                      <span className="player-status">
                        Status: {player.status}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4>Assign Officials</h4>

              <div className="selection-list">
                {clubOfficials.map((person) => (
                  <label key={person.id} className="selection-item">
                    <input
                      type="checkbox"
                      checked={selectedOfficials.includes(person.id)}
                      onChange={() => toggleOfficial(person.id)}
                    />
                    {person.name} - {person.role}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h4>Squad Confirmation</h4>

              <div className="review-box">
                <p>
                  Fixture: <strong>{fixture}</strong>
                </p>
                <p>
                  Competition: <strong>{competition}</strong>
                </p>
                <p>
                  Club: <strong>{loggedInClub.name}</strong>
                </p>
                <p>
                  Players Selected: <strong>{selectedPlayers.length}</strong>
                </p>
                <p>
                  Officials Selected: <strong>{selectedOfficials.length}</strong>
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2>Submit Squad Sheet</h2>

              {!submitted ? (
                <>
                  <div className="review-box">
                    <p>Ready to submit official squad to union for {fixture}.</p>
                  </div>

                  <button className="primary-btn" onClick={submitSquad}>
                    <Send size={18} />
                    Submit To Union
                  </button>
                </>
              ) : (
                <div className="review-box success-box">
                  <CheckCircle2 size={22} />
                  <p>
                    Squad sheet for <strong>{fixture}</strong> was submitted successfully on{" "}
                    {submittedAt}.
                  </p>
                </div>
              )}
            </div>
          )}
          {validationMessage && (
            <div className="review-box error-box">
              {validationMessage}
            </div>
          )}

          <div className="wizard-buttons">
            <button
              className="secondary-btn"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft />
              Previous
            </button>

            <button 
              className="primary-btn"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
  );
};

export default SquadSubmission;
