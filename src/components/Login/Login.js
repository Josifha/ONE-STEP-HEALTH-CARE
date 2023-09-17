import $ from 'jquery';
import React from 'react';
import './Login.css';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { firebaseConfig } from '../../FireBaseConfiguration';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { signInWithPhoneNumber } from "firebase/auth";

export default function Login() {
    
    const [aadharNo, setAadharNo] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const [organizationPassword, setOrganizationPassword] = useState("");
    const [usertype, setUserType] = useState("Type of User");

    const fireBaseConfiguration = firebaseConfig;

    const handleUserTypeChange =  eventKey => {
        setUserType(eventKey);

        if(eventKey == 'student') {
            showStudentForm();
        }  else if(eventKey == 'organization') { 
            showOrganizationForm();
        }  else if(eventKey == 'admin') { 
            showAdminForm();
        }
    };

    function showStudentForm() {

        $('#organization-form').hide();
        $("#organizationId").prop('required',false);
        $("#organizationPassword").prop('required',false);

        $('#admin-form').hide();
        $('#student-form').show();
    }

    function showOrganizationForm() {

        $('#student-form').hide();
        $("#aadharNo").prop('required',false);
        $("#phoneNo").prop('required',false);
        
        $('#admin-form').hide();
        $('#organization-form').show();
    }

    function showAdminForm() {      
        $('#student-form').hide();
        $('#organization-form').hide();
        $('#admin-form').show();
    }

    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        
        e.preventDefault();
        
        if(usertype == 'student') {
            const app = initializeApp(fireBaseConfiguration);
            const auth = getAuth(app);
            const authProvider = auth;
            
            if(window.recaptchaVerifier == null) {
                window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                    'size': 'normal',
                    'callback': function(response) {
                        console.log("success", response);
                        sendVerificationCode("+91 " +phoneNo, authProvider, appVerifier);
                    },
                    'expired-callback': function() {
                        console.log("expired-callback");
                    }
                }, authProvider);
                window.recaptchaVerifier.render().then(function(widgetId) {
                    window.recaptchaWidgetId = widgetId;
                    console.log("widgetId", widgetId);
                });
            }
            const appVerifier = window.recaptchaVerifier;
        
        } else if (usertype == 'organization') {
            navigate('/organization', {state: {
                organizationId: {organizationId}
                                    }
                            }
            ); 
        }
    };

    const sendVerificationCode = async(phoneNumber, auth, appVerifier) => {

        if(window.confirmationResult == null) {
            $('#recaptcha-container').hide();
            signInWithPhoneNumber(auth, phoneNumber, appVerifier).then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                navigate('/otp', {state: {
                                            aadharNo: {aadharNo}, 
                                            phoneNo: {phoneNo}
                                        }
                                    }
                );  
            }).catch((error) => {
                console.log(error);
            });
        }
    };

  return(
    <div class="login-page">
        <div class="form">
            <h4>One Step Health Care</h4>       
            <Form onSubmit={handleSubmit}>
                
                <Dropdown title={usertype} id="dropdown-menu-align-right" onSelect={handleUserTypeChange}>
                    <Dropdown.Toggle variant="Success" id="dropdown-basic">
                        {usertype}
                    </Dropdown.Toggle>
                    <Dropdown.Menu variant="Success">
                        <Dropdown.Item eventKey="student">Person</Dropdown.Item>
                        <Dropdown.Item eventKey="organization">Hospital</Dropdown.Item>
                        <Dropdown.Item eventKey="admin">Admin</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <div class="empty-div"></div>
                
                <div id= "student-form"  class="student-form">                    
                    <Form.Group className="mb-3" controlId="aadharNo">
                        <Form.Control type="text" placeholder="Aadhaar No" title="Please Enter Valid Aadhar No" value={aadharNo} onChange={(e) => setAadharNo(e.target.value)} pattern="^[2-9]{1}[0-9]{3}\s{1}[0-9]{4}\s{1}[0-9]{4}$" required/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="phoneNo">
                        <Form.Control type="text" placeholder="Phone No" title="Please Enter Valid Phone No" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} pattern="[7-9]{1}[0-9]{9}" required/>
                    </Form.Group>
                </div>

                <div id= "organization-form"  class="organization-form">                    
                    <Form.Group className="mb-3" controlId="organizationId">
                        <Form.Control type="text" placeholder="Organization Id" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} required/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="organizationPassword">
                        <Form.Control type="password" placeholder="Organization Password" value={organizationPassword} onChange={(e) => setOrganizationPassword(e.target.value)} required/>
                    </Form.Group>
                </div>

                <div id= "admin-form"  class="admin-form"></div> 

        

                <div id="recaptcha-container" class="justify-center flex"></div> 

                <div class="empty-div"></div> 
                
                <Button type="submit" variant="Success">login</Button>
                
            </Form>
        </div>
    </div>
  )
}