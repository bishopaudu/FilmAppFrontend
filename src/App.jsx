/* eslint-disable no-unused-vars */
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./components/Loader";
import { Table } from "./components/Table";
import { Modal } from "./components/Modal";
import { popupMessages } from "./utils";

export default function App() {

  const [popupMessage, setPopupMessages] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [responseFormat, setResponseFormat] = useState("json");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getallFilms = "http://localhost:8081/FilmAppApi/films/";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchFilms();
  }, [responseFormat, currentPage]);

  useEffect(() => {
    console.log(dataRows.length);
  }, [dataRows]);

  const handleFormatChange = (format) => {
    setResponseFormat(format);
  };

  const fetchFilms = async () => {
    try {
      const response = await axios.get(getallFilms, {
        headers: {
          Accept: `application/json`,
        },
      });
      setRows(response.data);
      setDataRows(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching films:", error);
    } finally {
      setLoading(false);
    }
  };

  const [rowToEdit, setRowToEdit] = useState(null);

  const handleDeleteRow = async (targetIndex) => {
    try {
      await axios.delete(
        `http://localhost:8081/FilmAppApi/films/${rows[targetIndex].id}`
      );
      setPopupMessages(popupMessages.deleted);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      setRows(rows.filter((_, idx) => idx !== targetIndex));
    } catch (error) {
      console.error("Error deleting film:", error);
    }
  };

  const handleEditRow = (idx) => {
    setRowToEdit(idx);
    setModalOpen(true);
  };

  const searchFilmById = async (filmId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/FilmAppApi/films/${filmId}`,
        {
          headers: {
            Accept: `application/json`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching film by ID:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    const filmData = await searchFilmById(searchId);
    if (filmData) {
      setRows([filmData]);
    } else {
      setRows([]);
    }
    setLoading(false);
  };

  const handleSubmit = (newRow) => {
    if (rowToEdit === null) {
      // Add new row
      setRows([...rows, newRow]);
      //setRows([newRow, ...rows]);
    } else {
      // Update existing row
      setRows(
        rows.map((currRow, idx) => {
          // If not the edited row, return as is
          if (idx !== rowToEdit) return currRow; 
          setShowPopup(true);
          setPopupMessages(popupMessages.updated);
          setTimeout(() => {
            setShowPopup(false);
          }, 3000);
          // If the edited row, return the new edited row
          return newRow; 
        })
      );
    }
  };

  return (
    <div className="App">
      {showPopup && <div className="success-popup">{popupMessage}</div>}
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button className="btn" onClick={handleSearch}>
          Search
        </button>
        <div className="select-container">
          <select
            value={responseFormat}
            onChange={(e) => handleFormatChange(e.target.value)}
          >
           <option value="application/json">JSON</option>
            <option value="application/xml">XML</option>
            <option value="text/plain">Text</option>
          </select>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn">
          Add
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <Table
            rows={currentItems}
            deleteRow={handleDeleteRow}
            editRow={handleEditRow}
            responseFormat={responseFormat}
          />
          {/* Pagination controls */}
          <div className="pagination-container">
            <button
              className="btn"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from(
              { length: Math.ceil(rows.length / itemsPerPage) },
              (_, index) =>
                index >= currentPage - 2 &&
                index <= currentPage + 2 && ( 
                  <button
                    key={index}
                    className={`btn ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                )
            )}
            <button
              className="btn"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(rows.length / itemsPerPage)}
            >
              Next
            </button>
          </div>

          {modalOpen && (
            <Modal
              closeModal={() => {
                setModalOpen(false);
                setRowToEdit(null);
              }}
              onSubmit={handleSubmit}
              popup={setShowPopup}
              popupMessage={setPopupMessages}
              defaultValue={rowToEdit !== null && rows[rowToEdit]}
            />
          )}
        </>
      )}
    </div>
  );
}
