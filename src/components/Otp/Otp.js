import $ from 'jquery';
import React from 'react';
import './Otp.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import OTPInput, { ResendOTP } from "otp-input-react";
import {useLocation} from 'react-router-dom';
import { firebaseConfig } from '../../FireBaseConfiguration';
import { initializeApp } from 'firebase/app';
import { getAuth} from "firebase/auth";
import { signInWithPhoneNumber } from "firebase/auth";

export default function Otp() {
         
    const [otp, setOtp] = useState("");

    const location = useLocation();

    const aadharNo = location.state.aadharNo.aadharNo;
    const phoneNo = location.state.phoneNo.phoneNo;

    const displayAadharNo = aadharNo;
    const displayPhoneNo = phoneNo;

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(location);

        if(window.confirmationResult != null) {
            console.log(window.confirmationResult);
            window.confirmationResult.confirm(otp).then((result) => {
                navigate('/student', {state: {
                                        aadharNo: displayAadharNo, 
                                        phoneNo: displayPhoneNo
                                        }
                                }
                );  
            }).catch((error) => {
                console.log(error);
            });
        }
          
    };

    const resendOTP = async (e) => {
        
        e.preventDefault();
        
        const fireBaseConfiguration = firebaseConfig;
        const app = initializeApp(fireBaseConfiguration);
        const auth = getAuth(app);
        const authProvider = auth;
        const appVerifier = window.recaptchaVerifier;
        sendVerificationCode("+91 " +displayPhoneNo, authProvider, appVerifier);
        
    };

    const sendVerificationCode = async(phoneNumber, auth, appVerifier) => {

        if(window.confirmationResult == null) {
            $('#recaptcha-container').hide();
            signInWithPhoneNumber(auth, phoneNumber, appVerifier).then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                navigate('/student', {state: {
                                            aadharNo: {displayAadharNo}, 
                                            phoneNo: {displayPhoneNo}
                                        }
                                    }
                );  
            }).catch((error) => {
                console.log(error);
            });
        }
    };

    

  return(
    <div class="otp-page">
        <div class="otp-div">
            <h4>Scard</h4>
            <Form class="login-form" onSubmit={handleSubmit}>

                <h5>Enter Verification Code</h5>
                <span>Please enter the 6-digit verification code that was sent to your mobile device</span>

                <div class="empty-div"></div>
                
                <div id="otp-form">    
                    <OTPInput id="otp-input" class="align-items-center" value={otp} onChange={setOtp} autoFocus OTPLength={6} otpType="number" disabled={false}/>
                    <ResendOTP onClick={resendOTP}/>
                </div>

                <div class="empty-div"></div>
                <div class="empty-div"></div>
                <div class="empty-div"></div>

                <Button type="submit" variant="Success">continue</Button>
                
            </Form>                
        </div>
    </div>
  )
}