/* eslint-disable no-unused-vars */
import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./components/Loader";
import { Table } from "./components/Table";
import { Modal } from "./components/Modal";
import { popupMessages } from "./utils";

export default function App() {
  const [rowToEdit, setRowToEdit] = useState(null);
  const [popupMessage, setPopupMessages] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [responseFormat, setResponseFormat] = useState("application/json");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [noResults, setNoResults] = useState(false);

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
    setLoading(true);
    setNoResults(false);
    try {
      const response = await axios.get(getallFilms, {
        headers: {
          Accept: responseFormat,
        },
      });
      if (responseFormat === "application/json") {
        setRows(response.data);
        setDataRows(response.data);
      } else {
        console.log(response.data);
      }
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching films:", error);
    } finally {
      setLoading(false);
    }
  };

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
    console.log(idx);
    setRowToEdit(idx);
    setModalOpen(true);
  };

  const searchFilmById = async (filmId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/FilmAppApi/films/${filmId}`,
        {
          headers: {
            Accept: responseFormat,
          },
        }
      );
      if (responseFormat === "application/json") {
        return response.data;
      } else {
        console.log(response.data);
        return null;
      }
    } catch (error) {
      console.error("Error searching film by ID:", error);
      return null;
    }
  };

  const searchFilmByTitle = async (filmTitle) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/FilmAppApi/films?title=${filmTitle}`,
        {
          headers: {
            Accept: responseFormat,
          },
        }
      );
      if (responseFormat === "application/json") {
        return response.data;
      } else {
        console.log(response.data);
        return null;
      }
    } catch (error) {
      console.error("Error searching film by title:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setNoResults(false);
    let filmData = null;
    if (searchId) {
      filmData = await searchFilmById(searchId);
    } else if (searchTitle) {
      filmData = await searchFilmByTitle(searchTitle);
    }

    if (filmData) {
      setRows(Array.isArray(filmData) ? filmData : [filmData]);
    } else {
      setRows([]);
      setNoResults(true);
    }
    setLoading(false);
  };

  const handleSubmit = async (newRow) => {
    if (rowToEdit === null) {
      // Add new row
      setRows([...rows, newRow]);
        // Fetch updated movie list
        const updatedMovies = await axios.get(getallFilms);
        setRows(updatedMovies.data);
        setPopupMessages(popupMessages.added);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
    } else {
      // Update existing row
      const editedRowIndex = (currentPage - 1) * itemsPerPage + rowToEdit;
      setRows(
        rows.map((currRow, idx) => {
          if (idx === editedRowIndex) {
            return { ...currRow, ...newRow };
          }
          return currRow;
        })
      );
      setShowPopup(true);
      setPopupMessages(popupMessages.updated);
      const updatedMovies = await axios.get(getallFilms);
        setRows(updatedMovies.data);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  };
  /*const handleSubmit = async (newRow) => {
    if (rowToEdit === null) {
      try {
        const response = await axios.post(getallFilms, newRow);
        // Fetch updated movie list
        const updatedMovies = await axios.get(getallFilms);
        setRows(updatedMovies.data);
        console.log(updatedMovies.data);
        setPopupMessages(popupMessages.added);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
      } catch (error) {
        console.error("Error adding film:", error);
      }
    } else {
      // Update existing row
      const editedRowIndex = (currentPage - 1) * itemsPerPage + rowToEdit;
      setRows(
        rows.map((currRow, idx) => {
          if (idx === editedRowIndex) {
            return { ...currRow, ...newRow };
          }
          return currRow;
        })
      );
      setShowPopup(true);
      setPopupMessages(popupMessages.updated);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  };*/
  
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
        <input
          type="text"
          className="search-bar"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
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
          {noResults && <div className="no-results">No results found</div>}
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
              (_, index) => {
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(
                  startPage + 4,
                  Math.ceil(rows.length / itemsPerPage)
                );
                if (index >= startPage - 1 && index <= endPage - 1) {
                  return (
                    <button
                      key={index}
                      className={`btn ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  );
                }
                return null;
              }
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

