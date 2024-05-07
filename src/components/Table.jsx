/* eslint-disable react/prop-types */
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import "./Table.css";


export const Table = ({ rows, deleteRow, editRow }) => {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Year</th>
            <th>Director</th>
            <th>Stars</th>
            <th className="expand">Review</th>
            <th className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            return (
              <tr key={idx}>
                <td>{row.id}</td>
                <td>{row.title}</td>
                <td>{row.year}</td>
                <td>{row.director}</td>
                <td>{row.stars}</td>
                <td>{row.review}</td>
                <td className="actions">
                  <BsFillTrashFill
                    className="delete-btn"
                    onClick={() => deleteRow(idx)}
                  />
                  <BsFillPencilFill
                    className="edit-btn"
                    onClick={() => editRow(idx)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


