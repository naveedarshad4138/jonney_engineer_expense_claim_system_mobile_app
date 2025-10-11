import React from 'react';

const Loader = () => {
  return (
    <div class="steddy-loader d-flex" id="steddy-loader">
        <div class="steddy-loader-container">
            <div class="steddy-ai-circle">
                <div class="steddy-wave"></div>
                <div class="steddy-wave delay-1"></div>
                <div class="steddy-wave delay-2"></div>
            </div>
            <div class="steddy-loader-text">Processing with AI...</div>
            <div class="steddy-progress-bar">
                <div class="steddy-progress"></div>
            </div>
            <div class="steddy-loader-text" style={{"color":"red"}}>Don't reload page while processing.</div>
        </div>
    </div>
  );
};

export default Loader;
