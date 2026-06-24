import "../styles/pages/landing/PaymentPage.css";
import logo from "../assets/logo.png";
import { FiUser } from "react-icons/fi";
import { useState } from "react";

import bg from "../assets/basketball-card.png";
import mtn from "../assets/mtn.png";
import airtel from "../assets/airtel.jfif";
import bank from "../assets/bank.png";

export default function Payments() {
    const [plan, setPlan] = useState("premium");
    const [billing, setBilling] = useState("monthly");
    const [method, setMethod] = useState("mtn");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [paymentType, setPaymentType] = useState("membership");

    const [ticketType, setTicketType] = useState("standard");
    const [quantity, setQuantity] = useState(1);

    const [expand, setExpand] = useState(false);

    const profile = { image: "" };

    const pricing: any = {
        premium: { monthly: 15000, quarterly: 40000, yearly: 150000 },
        pro: { monthly: 10000, quarterly: 28000, yearly: 100000 },
        basic: { monthly: 5000, quarterly: 13000, yearly: 50000 },
    };

    const amount = pricing[plan][billing];

    const ticketPrices: any = {
        standard: 10000,
        vip: 25000,
        vvip: 50000,
    };

    const ticketTotal = ticketPrices[ticketType] * quantity;

    const handlePayment = () => {

        const paymentData = {
            type: paymentType,

            amount:
                paymentType === "membership"
                    ? amount
                    : ticketTotal,

            method,

            plan:
                paymentType === "membership"
                    ? plan
                    : null,

            billing:
                paymentType === "membership"
                    ? billing
                    : null,

            ticketType:
                paymentType === "ticket"
                    ? ticketType
                    : null,

            quantity:
                paymentType === "ticket"
                    ? quantity
                    : null,
        };


        console.log("Payment Data:", paymentData);


        // later:
        // send this data to your backend
        // axios.post("/api/payment", paymentData)


        setShowConfirmation(false);
    };

    return (
        <div
            className="payment-page"
            style={{
                backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.9)), url(${bg})`,
            }}
        >
            {/* NAVBAR */}
            <nav className="news-navbar">
                <div className="navbar-logo">
                    <img src={logo} alt="Logo" />
                </div>

                <div className="navbar-links">
                    <a href="#">Membership</a>
                    <a href="#">Purchase</a>
                    <a href="#">Member Card</a>
                </div>

                <div className="profile-wrapper">
                    {profile?.image ? (
                        <img
                            src={profile.image}
                            className="profile-img"
                            onClick={() => setExpand(!expand)}
                            alt="profile"
                        />
                    ) : (
                        <FiUser className="icon" />
                    )}
                </div>
            </nav>

            {/* INTRO */}
            <div className="payment-intro">
                <h1>Complete Your <span>Payment</span></h1>
                <p>
                    Unlock full access - live matches, stats, clubs, and exclusive competitions.
                </p>
            </div>

            {/* TOGGLE */}
            <div className="payment-toggle">
                <button
                    className={paymentType === "membership" ? "active" : ""}
                    onClick={() => setPaymentType("membership")}
                >
                    Membership
                </button>

                <button
                    className={paymentType === "ticket" ? "active" : ""}
                    onClick={() => setPaymentType("ticket")}
                >
                    Ticket
                </button>
            </div>

            {/* ===================== MEMBERSHIP ===================== */}
            {paymentType === "membership" && (
                <div className="payment-hero">

                    {/* LEFT */}
                    <div className="hero-card left">
                        <h2>Select Package</h2>

                        <select onChange={(e) => setPlan(e.target.value)}>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="premium">Premium</option>
                        </select>

                        <h2>Billing Cycle</h2>

                        <select onChange={(e) => setBilling(e.target.value)}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        <h2>Payment Method</h2>

                        <div className="payment-methods">

                            <label className={`method-card ${method === "mtn" ? "active" : ""}`}>
                                <img src={mtn} alt="MTN" />
                                <span>MTN Mobile Money</span>
                                <input
                                    type="radio"
                                    checked={method === "mtn"}
                                    onChange={() => setMethod("mtn")}
                                />

                            </label>

                            <label className={`method-card ${method === "airtel" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    checked={method === "airtel"}
                                    onChange={() => setMethod("airtel")}
                                />
                                <img src={airtel} alt="Airtel" />
                                <span>Airtel Money</span>
                            </label>

                            <label className={`method-card ${method === "bank" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    checked={method === "bank"}
                                    onChange={() => setMethod("bank")}
                                />
                                <img src={bank} alt="Bank" />
                                <span>Bank Transfer</span>
                            </label>

                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="hero-card right">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Plan</span>
                            <span>{plan.toUpperCase()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Billing</span>
                            <span>{billing}</span>
                        </div>

                        <div className="summary-row">
                            <span>Payment</span>
                            <span>{method.toUpperCase()}</span>
                        </div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>UGX {amount.toLocaleString()}</span>
                        </div>

                        <button className="pay-btn" onClick={() => setShowConfirmation(true)}>Proceed to Pay</button>
                    </div>

                </div>
            )}

            {/*..........TICKETs ............... */}
            {paymentType === "ticket" && (
                <div className="payment-hero">

                    {/* LEFT */}
                    <div className="hero-card left">
                        <h2>Match Ticket</h2>

                        <div className="match-info">
                            <h3>Vipers SC <span>vs</span> KCCA FC</h3>
                            <p>🏟  Namboole Stadium</p>
                            <p>            </p>
                            <p>📅  30 June 2026 • 7:00 PM</p>
                        </div>

                        <h3>Ticket Type</h3>

                        <select onChange={(e) => setTicketType(e.target.value)}>
                            <option value="standard">Standard</option>
                            <option value="vip">VIP</option>
                            <option value="vvip">VVIP</option>
                        </select>

                        <h3>Quantity</h3>

                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />

                         <h2>Payment Method</h2>

            <div className="payment-methods">

              <label className={`method-card ${method === "mtn" ? "active" : ""}`}>
                <img src={mtn} alt="MTN" />
                <span>MTN Mobile Money</span>
                <input
                  type="radio"
                  checked={method === "mtn"}
                  onChange={() => setMethod("mtn")}
                />
                
              </label>

              <label className={`method-card ${method === "airtel" ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={method === "airtel"}
                  onChange={() => setMethod("airtel")}
                />
                <img src={airtel} alt="Airtel" />
                <span>Airtel Money</span>
              </label>

              <label className={`method-card ${method === "bank" ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={method === "bank"}
                  onChange={() => setMethod("bank")}
                />
                <img src={bank} alt="Bank" />
                <span>Bank Transfer</span>
              </label>

            </div>
                    </div>

                    {/* RIGHT */}
                    <div className="hero-card right">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Type</span>
                            <span>{ticketType.toUpperCase()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Quantity</span>
                            <span>{quantity}</span>
                        </div>

                        <div className="summary-row">
                            <span>Unit Price</span>
                            <span>UGX {ticketPrices[ticketType].toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Payment</span>
                            <span>{method.toUpperCase()}</span>
                        </div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>UGX {ticketTotal.toLocaleString()}</span>
                        </div>

                        <button className="pay-btn" onClick={() => setShowConfirmation(true)} >Proceed to Pay</button>
                    </div>

                </div>
            )}
            {showConfirmation && (
                <div className="payment-overlay">

                    <div className="confirmation-card">

                        <h2>Confirm Payment</h2>

                        <p>
                            You are about to pay for:
                        </p>

                        <div className="confirm-row">
                            <span>Payment Type</span>
                            <span>{paymentType.toUpperCase()}</span>
                        </div>


                        {paymentType === "membership" && (
                            <>
                                <div className="confirm-row">
                                    <span>Plan</span>
                                    <span>{plan.toUpperCase()}</span>
                                </div>

                                <div className="confirm-row">
                                    <span>Billing</span>
                                    <span>{billing}</span>
                                </div>
                            </>
                        )}


                        {paymentType === "ticket" && (
                            <>
                                <div className="confirm-row">
                                    <span>Ticket</span>
                                    <span>{ticketType.toUpperCase()}</span>
                                </div>

                                <div className="confirm-row">
                                    <span>Quantity</span>
                                    <span>{quantity}</span>
                                </div>
                            </>
                        )}


                        <div className="confirm-row total">
                            <span>Total</span>

                            <span>
                                UGX {
                                    paymentType === "membership"
                                        ? amount.toLocaleString()
                                        : ticketTotal.toLocaleString()
                                }
                            </span>

                        </div>


                        <div className="confirmation-buttons">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </button>


                            <button
                                className="confirm-btn"
                                onClick={handlePayment}
                            >
                                Confirm Payment
                            </button>

                        </div>


                    </div>

                </div>
            )}
        </div>
    );
}