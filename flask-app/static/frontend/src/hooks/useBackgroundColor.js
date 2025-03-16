import { useEffect } from 'react';

const useBackgroundColor = (isSignupActive) => {
  useEffect(() => {
    if (isSignupActive) {
      document.body.style.backgroundColor = "#ffffff";
      document.querySelector(".App").style.backgroundColor = "#ffffff";
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#ffffff");
    } else {
      document.body.style.backgroundColor = "#000000";
      document.querySelector(".App").style.backgroundColor = "#000000";
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#000000");
    }
  }, [isSignupActive]); // Runs whenever `isSignupActive` changes
};

export default useBackgroundColor;