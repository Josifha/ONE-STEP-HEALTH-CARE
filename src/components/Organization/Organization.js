import $ from 'jquery';
import React from 'react';
import './Organization.css';
import { useState, useEffect  } from "react";
import {useLocation} from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion'
import { Button, Table, Form, Row, Col } from 'react-bootstrap';
import { firebaseConfig } from '../../FireBaseConfiguration';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {properties} from './properties';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Organization() {
    const [accessToken, setAccessToken] = useState()
    const [file, setFile] = useState({                        //image file object
      name: "",
      size: "",
      type: ""
    })                         
    const [capturedFileId, setCapturedFileId] = useState("")  //id of image file in Capture Service
    const [ocrResponse, setOCRResponse] = useState({          //response of OCR Service (value contains the id)
      resultItems: [{
        "files":[{
            "name":"",
            "value":"",
            "contentType":"",
            "src":"",
            "fileType":""
        }]    
      }]
    })
    const [pdfFile, setPdfFile] = useState({                //file blob retrieved from Capture Service
      size: "",
      type: ""
    })
    const [uploadedFile, setUploadedFile] = useState({      //response of file uploaded to Content Storage
      id: "",
      mimeType: "",
      size: ""
    })
    const [fileMetadata, setFileMetadata] = useState({
      id: "",
      name: "",
      mime_type: "",
      content_size: ""    
    })
  
    const [folderName, setFolderName] = useState("")
    const [folderId, setFolderId] = useState("")
  
    //Setting placeholder property for input fields to "Processing..."
    const [tokenPlaceholder, setTokenPlaceholder] = useState("Authentication Token Information")
    const [capFileIdPlaceholder, setCapFileIdPlaceholder] = useState("")
    const [ocrRespIdPlaceholder, setOcrRespIdPlaceholder] = useState("")
    const [uploadedFileIdPlaceholder, setUploadedFileIdPlaceholder] = useState("")
    const [retrieveStatus, setRetrieveStatus] = useState("")
  
  
    /**
     * Step 1 - getAuthToken() - Get Authentication Token from OCP
     */
    function getAuthToken() {
      setTokenPlaceholder("Processing...")
  
      const url = `${properties.base_url}/tenants/${properties.tenant_id}/oauth2/token`
      const requestOptions = {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
              client_id: properties.client_id,
              client_secret: properties.client_secret,
              grant_type: "password",
              username: properties.username,
              password: properties.password
          })
      }
  
      fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => setAccessToken(data.access_token))
        .catch(error => console.error("Error: ", error))
    }
  
    /**
     * Step 2A - handleFile() - Read the file selected by the user
     */
    function handleFile(event) {
      setFile(event.target.files[0])
    }
   
    /**
     * Step 2B - handleUpload() - Upload the file to Capture Service
     */
    function handleUpload() {
      setCapFileIdPlaceholder("Processing...")
      
      const url = `${properties.base_url}/capture/cp-rest/v2/session/files`
      const fetchOptions = {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/hal+json",
          'Accept-Language': "en-US",
          'Content-Type': file.type,
          'Content-Length': file.size
        },
        body: file
      }
  
      fetch(url, fetchOptions)
        .then(response => response.json())
        .then(data => setCapturedFileId(data.id))
        .catch(error => console.error("Error: ", error))
    }
  
    /**
     * Step 3 - createSearchablePDF() - Call OCR Service 
     */
    function createSearchablePDF() {
      setOcrRespIdPlaceholder("Processing...")
      const pdfFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      const url = `${properties.base_url}/capture/cp-rest/v2/session/services/fullpageocr`
      const fetchOptions = {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/hal+json",
          'Accept-Language': "en-US",
          'Content-Type': "application/hal+json"
        },
        body: JSON.stringify({
          "serviceProps": [
            {"name": "Env","value": "D"},
            {"name": "OcrEngineName","value": "Advanced"}
            ],
          "requestItems": [
            {"nodeId": 1,"values": [
                {"name": "OutputType", "value": "pdf"}
              ],
              "files": [
                {"name": `${pdfFileName}`,
                  "value": `${capturedFileId}`,
                  "contentType": `${file.type}`
                }
              ]
            }
          ]
        })
      }
    
      fetch(url, fetchOptions)
        .then(response => response.json())
        .then(data => setOCRResponse(data))
        .catch(error => console.error("Error: ", error))
    }
    
  
    /**
     * Step 4A - retrieveFileFromCaptureService() - Retrieve PDF file blob from Capture Service
     */
    async function retrieveFileFromCaptureService() {
      setRetrieveStatus("Processing...")
      const captureUrl = `${properties.base_url}/capture/cp-rest/v2/session/files/${ocrResponse.resultItems[0].files[0].value}`
      const captureFetchOptions = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': ocrResponse.resultItems[0].files[0].contentType
        }
      }
  
      const response = await fetch(captureUrl, captureFetchOptions)
      const blob = await response.blob()
      setPdfFile(blob)
      setRetrieveStatus("...Retrieved "+blob.size+" bytes")
    }
  
    /**
     * Step 4B - uploadFileToCSS() - upload File to Content Storage
     */
    async function uploadFileToCSS() {
      setUploadedFileIdPlaceholder("Processing...")
  
      const cssUrl =`${properties.css_url}/v2/tenant/${properties.tenant_id}/content`
      const cssFetchOptions = {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/hal+json",
          'Content-Type': pdfFile.type,
          'Content-Length': pdfFile.size 
        },
        body: pdfFile
      }
  
      const response = await fetch(cssUrl, cssFetchOptions)
      const data =  await response.json()
      setUploadedFile(data.entries[0])
    }
  
    /**
     * Step 5A - getFolderName(event) - Get folder name entered by the user
     */
    function getFolderName(event) {
      setFolderName(event.target.value)
      setFolderId("")
    }
  
    /**
     * Step 5B - createFolder() - Create new folder using CMS
     */
    async function createFolder() {
      //Ensure user has provided a folder name
      if (!folderName){
        alert("Please enter a folder name")
        return
      }
  
      //Lookup folder metadata in case user uses the same folder name
      const url = `${properties.base_url}/cms/instances/folder/cms_folder?include-total=true&filter=name%20eq%20%27${folderName}%27`
  
      const fetchOptions = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/hal+json"
        }
      }
  
      const response = await fetch(url, fetchOptions)
      const data = await response.json()
      
      if (data.total > 0) {
        console.log("Folder already exists")
        setFolderId(data._embedded.collection[0].id)
      }
  
      //Create a new folder
      else {
        console.log("Creating a new folder")
  
        const url2 = `${properties.base_url}/cms/instances/folder/cms_folder`
        const fetchOptions2 = {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json', 
              'accept': 'application/hal+json'
            },
            body: JSON.stringify({
              "name": folderName,
              "display_name": folderName,
              "description": "Folder created for demo",
              "type": "cms_folder"
            })
        }
    
        const response2 = await fetch(url2, fetchOptions2)
        const data2 = await response2.json()
  
        setFolderId(data2.id)
      }
    }
  
    /**
     * Step 6 - createMetadataForFile() - Create metadata for PDF file
     */
    async function createMetadataForFile() {
  
      //Ensure user has created a folder
      if (!folderId){
        alert("Please create a folder before creating the file metadata")
        return
      }
  
      //Look up metadata for the file
      const pdfFileName = ocrResponse.resultItems[0].files[0].name + "." + ocrResponse.resultItems[0].files[0].fileType
  
      const url = `${properties.base_url}/cms/instances/file/cms_file?include-total=true&filter=name eq '${pdfFileName}' and parent_folder_id eq '${folderId}'&sortby=version_no asc`
      const fetchOptions = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/hal+json"
        }
      }
  
      const response = await fetch(url, fetchOptions)
      const data = await response.json()
  
      if (data.total > 0) {
        console.log("Metadata  already exists. # of existing versions =",data.total)
  
        //Add file as new version
        const url2 = `${properties.base_url}/cms/instances/file/cms_file/${data._embedded.collection[data.total-1].id}/nextVersion`
        const fetchOptions2 = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/hal+json',
            'Content-Type': 'application/hal+json' 
          },
          body: JSON.stringify({
            "name": pdfFileName,
            "description": "PDF File created from OCR of uploaded image",
            "parent_folder_id": folderId,
            "renditions": [{
                "name": pdfFileName,
                "rendition_type": "primary",
                "blob_id": uploadedFile.id,
                "mime_type": uploadedFile.mimeType
              }]          
          })
        }
  
        const response2 = await fetch(url2, fetchOptions2)
        const data2 = await response2.json()
        console.log("Created version #",data2.version_no)
        setFileMetadata(data2)
      }
  
      //Create a new file in CMS
      else { 
        console.log("Metadata does not exists, creating a new one")
  
        const url2 = `${properties.base_url}/cms/instances/file/cms_file`
        const fetchOptions2 = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/hal+json',
            'Content-Type': 'application/hal+json' 
          },
          body: JSON.stringify({
            "name": pdfFileName,
            "description": "PDF File created from OCR of uploaded image",
            "parent_folder_id": folderId,
            "renditions": [{
                "name": pdfFileName,
                "rendition_type": "primary",
                "blob_id": uploadedFile.id,
                "mime_type": uploadedFile.mimeType
              }]
          })
        }
  
        const response2 = await fetch(url2, fetchOptions2)
        const data2 = await response2.json()
        setFileMetadata(data2)
      }
    }
  
    function retrieveFile() {
      const url =`${properties.css_url}/v2/content/${uploadedFile.id}/download?object-id=${fileMetadata.id}&file-name=${fileMetadata.name}&mime-type=${fileMetadata.mime_type}`
  
      const fetchOptions = {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': "application/octet-stream"
        }
      }
  
      fetch(url, fetchOptions)
        .then(response => response.blob())
        .then(blob => {
          const fileURL = URL.createObjectURL(blob)
          let alink = document.createElement('a')
          alink.href = fileURL
          alink.download = fileMetadata.name
          alink.click()
          URL.revokeObjectURL(fileURL)
        })
        .catch(error => console.error("Error: ", error))
    }
    const location = useLocation();
    const organizationId = location.state.organizationId.organizationId;
    
    const displayOrgId = organizationId;
    let basicStudentData = [];
    let collegeData = [];
    let twelthData = [];
    let tenthData = [];

    const fireBaseConfiguration = firebaseConfig;
    const app = initializeApp(fireBaseConfiguration);
    const db = getFirestore(app);

    const [aadharNo, setAadharNo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const basicStudentQuery = query(collection(db, "basic"), where("aadharNo", "==", aadharNo));
        const basicUnSubscribe = onSnapshot(basicStudentQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                basicStudentData.push((doc.data()));
                createBasicStudentRow();
            });
        });

        const collegeQuery = query(collection(db, "college"), where("aadharNo", "==", aadharNo));
        const collegeUnsubscribe = onSnapshot(collegeQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                collegeData.push((doc.data()));
                createCollegeRow();
            });
        });

        const twelthQuery = query(collection(db, "12th"), where("aadharNo", "==", aadharNo));
        const twelthUnsubscribe = onSnapshot(twelthQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                twelthData.push((doc.data()));
                createTwelthRow();
            });
        });

        const tenthQuery = query(collection(db, "tenth"), where("aadharNo", "==", aadharNo));
        const tenthUnsubscribe = onSnapshot(tenthQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                tenthData.push((doc.data()));
                create10thRow();
            });
        });

    };
    
    function createBasicStudentRow() {
        if(basicStudentData.length != 0 ) {
            $("#basic-student tbody tr").remove();
            var basic_student_row = "<tr>";
            basicStudentData.forEach(function (data) {
                basic_student_row = basic_student_row + "<td>" + data.aadharNo + "</td>";
                basic_student_row = basic_student_row + "<td>" + data.phoneNo + "</td>";
                basic_student_row = basic_student_row + "<td>" + data.firstName + " " + data.lastName + "</td>";
                basic_student_row = basic_student_row + "<td>" + data.gender + "</td>";
                basic_student_row = basic_student_row + "<td>" + data.dob.toDate().toLocaleDateString() + "</td>";
                basic_student_row = basic_student_row + "<td>" + data.bloodGroup + "</td>";
            }); 
            basic_student_row = basic_student_row + "</tr>";
            $("#basic-student tbody").append(basic_student_row);
            $('#basic-student').show();
        }
    }

    function createCollegeRow() {
        if(collegeData.length != 0 ) {
            $("#college-table tbody tr").remove();
            var college_row = "<tr>";
            collegeData.forEach(function (data) {
                college_row = college_row + "<td>" + data.collegeName + "</td>";
                college_row = college_row + "<td>" + data.course + "</td>";
                college_row = college_row + "<td>" + data.yearOfJoining + "</td>";
                college_row = college_row + "<td>" + data.yearOfStudying + "</td>";
                college_row = college_row + "<td>" + data.noOfArrears + "</td>";
                college_row = college_row + "<td>" + data.yearofpassout + "</td>";
                college_row = college_row + "<td>" + data.CGPA + "</td>";
            }); 
            college_row = college_row + "</tr>";
            $("#college-table tbody").append(college_row);
            $('#college-table').show();
        }
    }
    
    function createTwelthRow() {
        if(twelthData.length != 0 ) {
            $("#twelth-table tbody tr").remove();
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
            $("#tenth-table tbody tr").remove();
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
    
  return(
    <div class="organization-page">
        <div class="detail">
            <h4>One Step Health Care</h4>    
            <h5>Organization Id: {displayOrgId}</h5>
            <div class="empty-div"></div>  
            <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group as={Row} className="mb-3" controlId="aadharNo">
                    <Form.Label column sm={2}>Search Patient Record</Form.Label>
                    <Col sm={10}>
                        <Form.Control type="text" placeholder="Aadhaar No" value={aadharNo} onChange={(e) => setAadharNo(e.target.value)}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Col sm={7}>
                        <Button type="submit" variant="Success">search</Button>
                    </Col>
                </Form.Group>
            </Form>
            </div>
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
                        <Accordion.Header>Born Details</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "college-table" className="college-table">
                                <thead>
                                    <tr>
                                      <th>Hospital Name</th>
                                        <th>Doctor ID</th>
                                        <th>Year of Born</th>
                                        <th>Weight</th>
                                        <th>Height</th>
                                        <th>Parents Name</th>
                                        <th>Parents ID</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>Last Check Up</Accordion.Header>
                        <Accordion.Body>
                        <div>
                            <Table bordered variant="success" id= "twelth-table" className="twelth-table">
                                <thead>
                                    <tr>
                                        <th>Hospital Name</th>
                                        <th>Year </th>
                                        <th>Symptoms</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </Table>
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>Prescription Upload</Accordion.Header>
                        <Accordion.Body>
                        <h1 className="ot2-sample-header">OpenTextAPI</h1><br/>
      <div className="ot2-body">
      
      <hr align='left' />
      <div>
      
      <h3>2. Upload Prescription & Lab Report or Scan Report</h3>
      <label><b>Setp 1: </b></label>&nbsp;
          <label className="fileButton" htmlFor="upload">Select File
          <input id="upload" type="file" accept="image/*, .pdf" onChange={handleFile} />
      </label>
      <label>&nbsp;&nbsp;&nbsp; File Name: </label>
      <input type="text" name="fileName" value={file.name} size="35" readOnly/><br/><br/>
      <label><b>Setp 2: </b></label>&nbsp;
      <button onClick={handleUpload}>Upload File</button> 
      <label htmlFor='capturedFileId'>&nbsp;&nbsp; File Id: </label>
      <input type="text" name="capturedFileId" value={capturedFileId} placeholder={capFileIdPlaceholder} size="35" readOnly/><br/><br/>
    </div>
    <hr align='left' />
    <div>
      <h3>3. Convert Image into Text Searchable PDF</h3>
      <button onClick={createSearchablePDF}>Convert to Searchable PDF</button>
      <label htmlFor='ocrResponseId'>&nbsp;&nbsp; New File Id: </label>
      <input type="text" id="ocrResponseId" name="ocrResponseId" value={ocrResponse.resultItems[0].files[0].value} placeholder={ocrRespIdPlaceholder} size="35" readOnly/><br/><br/>
    </div>
    <hr align='left' />
    <div>
      <h3>4. Uploaded PDF to Content Storage</h3>
      <label><b>Step 1: </b></label>&nbsp;
      <button onClick={retrieveFileFromCaptureService}>Retrieve file from Capture Service</button>&nbsp;&nbsp;<i>{retrieveStatus}</i><br/><br/>
      <label><b>Step 2: </b></label>&nbsp;
      <button onClick={uploadFileToCSS}>Upload File To Content Storage</button>
      <label htmlFor='uploadedFileId'>&nbsp;&nbsp; CSS File Id: </label>
      <input type="text" name="uploadedFileId" value={uploadedFile.id} placeholder={uploadedFileIdPlaceholder} size="35" readOnly/><br/><br/>
    </div>
    <hr align='left' />
    <div>
      <h3>5. Create a folder for the file</h3>
      <label htmlFor='folderName'><b>Step 1: </b>&nbsp;Provide a folder name: </label>&nbsp;
      <input type="text" name="folderName" size="35" onChange={getFolderName} /><br/><br/>
      <label htmlFor='folderName'><b>Step 2: </b></label>&nbsp;
      <button onClick={createFolder}>Create Folder</button>&nbsp;&nbsp;
      <label htmlFor='folderId'>CMS Folder Id: </label>&nbsp;
      <input type="text" name="folderId" id="folderId" value={folderId} size="35" readOnly /><br/><br/>
    </div>
    <hr align='left' />
    <div>
      <h3>6. Create metadata for the PDF file</h3>
      <button onClick={createMetadataForFile}>Create Metadata</button>
      <label htmlFor='cmsFileId'>&nbsp;&nbsp; CMS File Id: </label>
      <input type="text" name="cmsFileId" value={fileMetadata.id} placeholder="" size="35" readOnly/><br/><br/>
    </div>
    <hr align='left' />
    <div>
      <h3>7. Download the PDF file from Content Storage</h3>
      <button onClick={retrieveFile}>Download the PDF File</button><br/><br/>
    </div>
    <hr align='left' />
                        </div>
                        </Accordion.Body>
                    </Accordion.Item>      
                </Accordion>
                <a class="btn btn-primary" href="/" role="button">Logout</a>
            </div>  
        </div>
    </div>
  )
}