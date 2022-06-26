import $ from 'jquery';
import React from 'react';
import './Student.css';
import {useLocation} from 'react-router-dom';
import { Table } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion'
import { firebaseConfig } from '../../FireBaseConfiguration';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Student() {
    
    const location = useLocation();
    const aadharNo = location.state.aadharNo;
    const phoneNo = location.state.phoneNo;

    let basicStudentData = [];
    let collegeData = [];
    let twelthData = [];
    let tenthData = [];
    let WorkDetailsData = [];

    const fireBaseConfiguration = firebaseConfig;
    const app = initializeApp(fireBaseConfiguration);
    const db = getFirestore(app);

    const basicStudentQuery = query(collection(db, "basic"), where("aadharNo", "==", aadharNo));
        const basicUnSubscribe = onSnapshot(basicStudentQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                basicStudentData.push((doc.data()));
                if ( $("#basic-student tbody tr").length == 0) {
                    createBasicStudentRow();
                }
            });
        });

        const collegeQuery = query(collection(db, "college"), where("aadharNo", "==", aadharNo));
        const collegeUnsubscribe = onSnapshot(collegeQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                collegeData.push((doc.data()));
                if ( $("#college-table tbody tr").length == 0) {
                    createCollegeRow();
                }
            });
        });

        const twelthQuery = query(collection(db, "12th"), where("aadharNo", "==", aadharNo));
        const twelthUnsubscribe = onSnapshot(twelthQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                twelthData.push((doc.data()));
                if ( $("#twelth-table tbody tr").length == 0) {
                    createTwelthRow();
                }
            });
        });
        const WorkDetails = query(collection(db, "Work Details"), where("aadharNo", "==", aadharNo));
        const WorkDetailsUnsubscribe = onSnapshot(WorkDetails, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                WorkDetailsData.push((doc.data()));
                if ( $("#WorkDetails-table tbody tr").length == 0) {
                    createWorkDetailsRow();
                }
            });
        });

        const tenthQuery = query(collection(db, "tenth"), where("aadharNo", "==", aadharNo));
        const tenthUnsubscribe = onSnapshot(tenthQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                tenthData.push((doc.data()));
                if ( $("#tenth-table tbody tr").length == 0) {
                    create10thRow();
                }
            });
        });

        function createBasicStudentRow() {
            if(basicStudentData.length != 0 ) {
                var basic_student_row = "<tr>";
                basicStudentData.forEach(function (data) {
                    basic_student_row = basic_student_row + "<td>" + data.aadharNo + "</td>";
                    basic_student_row = basic_student_row + "<td>" + data.phoneNo + "</td>";
                    basic_student_row = basic_student_row + "<td>" + data.firstName + " " + data.lastName + "</td>";
                    basic_student_row = basic_student_row + "<td>" + data.gender + "</td>";
                    basic_student_row = basic_student_row + "<td>" + data.dob.toDate().toLocaleDateString() + "</td>";
                    basic_student_row = basic_student_row + "<td>" + data.bloodGroup + "</td>";
                    $('#fullname').text(data.firstName + " " + data.lastName);
                }); 
                basic_student_row = basic_student_row + "</tr>";
                $("#basic-student tbody").append(basic_student_row);
                $('#basic-student').show();
            }
        }

        function createCollegeRow() {
            if(collegeData.length != 0 ) {
                var college_row = "<tr>";
                collegeData.forEach(function (data) {
                    college_row = college_row + "<td>" + data.collegeName + "</td>";
                    college_row = college_row + "<td>" + data.course + "</td>";
                    college_row = college_row + "<td>" + data.yearOfJoining + "</td>";
                    college_row = college_row + "<td>" + data.yearOfStudying + "</td>";
                    college_row = college_row + "<td>" + data.noOfArrears + "</td>";
                    college_row = college_row + "<td>" + data.Yearofpassout + "</td>";
                    college_row = college_row + "<td>" + data.CGPA + "</td>";
                }); 
                college_row = college_row + "</tr>";
                $("#college-table tbody").append(college_row);
                $('#college-table').show();
            }
        }
        
        function createTwelthRow() {
            if(twelthData.length != 0 ) {
                var twelth_row = "<tr>";
                twelthData.forEach(function (data) {
                    twelth_row = twelth_row + "<td>" + data.schoolName + "</td>";
                    twelth_row = twelth_row + "<td>" + data.passedOut + "</td>";
                    twelth_row = twelth_row + "<td>" + data.percentage + "%" + "</td>";
                }); 
                twelth_row = twelth_row + "</tr>";
                $("#twelth-table tbody").append(twelth_row);
                $('#twelth-table').show();
            }
        }

        function create10thRow() {
            if(tenthData.length != 0 ) {
                var tenth_row = "<tr>";
                tenthData.forEach(function (data) {
                    tenth_row = tenth_row + "<td>" + data.schoolName + "</td>";
                    tenth_row = tenth_row + "<td>" + data.passedOut + "</td>";
                    tenth_row = tenth_row + "<td>" + data.percentage + "%" + "</td>";
                }); 
                tenth_row = tenth_row + "</tr>";
                $("#tenth-table tbody").append(tenth_row);
                $('#tenth-table').show();
            }
        }

        function createWorkDetailsRow() {
            if(WorkDetailsData.length != 0 ) {
                var work_row = "<tr>";
                WorkDetailsData.forEach(function (data) {
                    work_row  = work_row + "<td>" + data.organisation+ "</td>";
                }); 
                work_row = work_row + "</tr>";
                $("#WorkDetails-table tbody").append(work_row);
                $('#WorkDetails-table').show();
            }
        }
    
    
  return(
    <div class="student-page">
        <div class="detail">
            <h4>Scard</h4>  
            <h5 id= "fullname"></h5>
            <h5>Aadhar No: {aadharNo}</h5>  
            <div class="empty-div"></div> 
            <div>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Basic Details</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "basic-student" className="basic-student-table">
                                <thead>
                                    <tr>
                                        <th>Aadhaar No</th>
                                        <th>Phone No</th>
                                        <th>Name</th>
                                        <th>Gender</th>
                                        <th>DOB</th>
                                        <th>Blood Group</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>College Details</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "college-table" className="college-table">
                                <thead>
                                    <tr>
                                        <th>College Name</th>
                                        <th>Course</th>
                                        <th>Year of Joining</th>
                                        <th>Year of Studying</th>
                                        <th>History of Backlogs</th>
                                        <th>Year of Passout</th>
                                        <th>CGPA</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>12th Grade</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "twelth-table" className="twelth-table">
                                <thead>
                                    <tr>
                                        <th>School Name</th>
                                        <th>Year of Passed Out</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>10th Grade</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "tenth-table" className="tenth-table">
                                <thead>
                                    <tr>
                                        <th>School Name</th>
                                        <th>Year of Passed Out</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>  
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>Work Details</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "WorkDetails-table" className="WorkDetails-table">
                                <thead>
                                    <tr>
                                        <th>Organisation</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>     
                </Accordion>
                <a class="btn btn-success" href="/" role="button">Logout</a>
            </div>  
        </div>
    </div>
  )
}