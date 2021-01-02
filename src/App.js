import React from "react";
import HandPose from "./Components/HandPose";
import Header from "./Components/Header";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Header></Header>
        <HandPose></HandPose>
      </div>
    );
  }
}

export default App;
