/* eslint-disable react/prop-types */
import  { useState } from "react";
import axios from "axios";
import "./Modal.css";
import {popupMessages} from "../utils"

export const Modal = ({ closeModal, onSubmit, defaultValue,popup,popupMessage}) => {
  const [formState, setFormState] = useState(
    defaultValue || {
      title: "",
      year: "",
      director: "",
      stars: "",
      review: "",
    }
  );
  const [errors, setErrors] = useState("");

  const validateForm = () => {
    if (formState.title && formState.year && formState.director  && formState.stars  && formState.review) {
      setErrors("");
      return true;
    } else {
      let errorFields = [];
      for (const [key, value] of Object.entries(formState)) {
        if (!value) {
          errorFields.push(key);
        }
      }
      setErrors(errorFields.join(", "));
      return false;
    }
  };

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
    try {
      const response = defaultValue
        ? await axios.put(`http://localhost:8081/FilmAppApi/films/${defaultValue.id}`, formState,
      )
        : await axios.post('http://localhost:8081/FilmAppApi/films', formState,
        );
          onSubmit(response.data);
      closeModal();
      popup(true);
      popupMessage(popupMessages.added)
      setTimeout(() => {
        popup(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === "modal-container") closeModal();
      }}
    >
      <div className="modal">
        <form>
        <div className="form-group">
            <label htmlFor="title">Title</label>
            <input name="title" onChange={handleChange} value={formState.title} />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input name="year" onChange={handleChange} value={formState.year} />
          </div>
          <div className="form-group">
            <label htmlFor="director">Director</label>
            <input name="director" onChange={handleChange} value={formState.director} />
          </div>
          <div className="form-group">
            <label htmlFor="stars">Stars</label>
            <input name="stars" onChange={handleChange} value={formState.stars} />
          </div>
          <div className="form-group">
            <label htmlFor="review">Review</label>
            <textarea
              name="review"
              onChange={handleChange}
              value={formState.review}
            />
          </div>
        
          {errors && <div className="error">{`Please include: ${errors}`}</div>}
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};