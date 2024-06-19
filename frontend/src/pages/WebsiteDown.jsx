import React, { useState } from 'react'
import './WebsiteDown.css'

const WebsiteDown = () => {
    const [showPopup, setShowPopup] = useState(true)

    return (
      showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Website Down</h2>
            <p>Our website is currently down for maintenance. We apologize for the inconvenience.</p>
            {/* <button onClick={() => setShowPopup(false)}>Close</button> */}
          </div>
        </div>
      )
    );
}

export default WebsiteDown
