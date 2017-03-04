export function generateRon(position){
  return {
    id: "ron-"+position.id,
    firstName: "RON",
    lastName: "",
    uid: "ron",
    positionId: position.id,
    Position: position,
    elected: false,
    manifestoOne: "",
    manifestoTwo: "",
    manifestoThree: "",
    order: 999,
    photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAgMAAAAEE2bmAAAADFBMVEX////ExMSSkpJvb29L28/3AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfhAwMVDg2+BocRAAADl0lEQVR42u2aPZLTQBBGLblYVaHAGVSR+AAEOoJ9BGJIyQg4gnSEvZF0BAccQAERkQMFNuXVsGvKrGxr/noeXkHNd4BXUs/XMz3dM5tFRUVFBeuNetKGQCX1kdWvw1Hpb9SjqmCWelYoaj5gNYGsesDqw1BLNdQ2iLU6Yx1CUJk6V4jJvl6w9owhQm2RXbE2UOTDol9fsXruF+U/uRxhdVi4xAFL1JjWWLikAVuMsloRqxhl7ZgEkqdRomFJgj/XsBos9DK3rjQsSfBLDevALaNoIUFWpmU12DJKTkmSVWhZO8xeElOQLKUwU8wNrApkNS/Iyg2sFrMqy9q+IGtpYHVYOvon5MrA8k2i2sB64NLRuzg0sVRkRVZkRVZk/TesGjw7SvBMK8GzlqwByNpkqvUXySJr36nW9yl4hyHvVpO9P5J35Kn2Achex1T7Odpd+kHAKsBe2hJbRrb3SPZEyV4t2kNeYKHXZVEjYpGzAHJGgc5OMixcM3TWhM7AyNkcOTNEZ5nkjJWc/V7kd9hMmpyVozP8wYeFftbgzUNfBbNObzGkG9e57o6o+1lUVFRUVFRUVNQ/qE+PleEPoiy8+1P8fg9FDW9Egc+H75AL8lE5d0/Loa7Jk0qgf2xo6AjjP97C3wfbIbAJk9/ivVyLfZbEF+Vt3iDtmUWULGVqnGX65fhKcYPR2syqoMj72sLyiz4fltQ21gb7RZ+fLK0sd4vZUc55lDmwdtQqeti1dmFVQC769fsWTqwDFy43VyRuKCfrZ46sDguX21ytdGQ5BMw1XC4BmzuztsB+4+6wlTNLMcnolpLuobcHLPdg7SCnugTfI/RWt9Y+rAbYB90qxMyL1WGht00tll4sxYXe4nw/lHEhU09Wi2xedud7ht645xeerJ44Nxwy0hdlOj+8WS22jKatdeHNOtyEVXizemaDtmS3gNVgltCzUgGrxeylN1gmYHWYvfS7joTVQzuh6SgqJaw1cqAZjS9B6cwKshIRq8VsrzO+jLUDWYfgEtrGEtlek5CFiNVTO7Q2IafKKmWsNZaOmoQUsjYgq50oaztR1lTjtQFzaP238zEH90Ly7Ei5ZWTrCbL+ImtMyUlUcXfRe9exsV17rjfUhY5gnmUdxL9FGgqn36yhr7LPC0/6QI2tlPrmPGx6HeKF6/cXphz0HXG/16MEbwLejZJ+Sh9kfLwEhbwgfvVlSPoc3/FERUVFRc1mvwDLWtceQXkzcAAAAABJRU5ErkJggg=="
  };
}
