import React from "react";

const ListItem = ({ name, description, component }) => {
  return (
    <div style={{ padding: "0.5rem", margin: "0.5rem 0" }}>
      <div>
        <h5>{name}</h5>
        <div>{description}</div>
      </div>
      <div style={{ padding: "1rem" }}>{component}</div>
    </div>
  );
};

export default ListItem;
