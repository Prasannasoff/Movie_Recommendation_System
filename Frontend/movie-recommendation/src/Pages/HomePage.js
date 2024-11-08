import React, { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function IndexHeader() {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setLoggedIn(true);
    }, []);

    const handleNavigateHome = () => {
        if (loggedIn) {
            navigate('/home');
        } else {
            toast.warn('Please login to go to Home', { position: "top-center" });
        }
    };

    return (
        <>
            <div
                className="page-header section-dar"
                style={{
                    backgroundImage: "url(" + require("../Assets/img/BgImage.jpg") + ")",
                }}
            >
                <div className="filter" />
                <div className="content-center">
                    <Container>
                        <div className="title-brand">
                            <h1 className="presentation-title">MOVIE RECOMMENDATION SYSTEM</h1>
                            <div className="fog-low">
                                <img alt="..." src={require("../Assets/img/fog-low.png")} />
                            </div>
                            <div className="fog-low right">
                                <img alt="..." src={require("../Assets/img/fog-low.png")} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                className='trailerButton'
                                onClick={handleNavigateHome}
                            >
                                Home
                            </button>
                            {!loggedIn && (
                                <button
                                    className='favouriteButton'
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </Container>
                </div>
                <div
                    className="moving-clouds"
                    style={{
                        backgroundImage: "url(" + require("../Assets/img/clouds.png") + ")",
                    }}
                />
            </div>
            <ToastContainer />
        </>
    );
}

export default IndexHeader;
