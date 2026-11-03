
.findora-app {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  color: white;

  background: linear-gradient(
    120deg,
    #A5E7FF,
    #1598F7,
    #00C8FF,
    #2563EB,
    #315BFF,
    #172554,
    #1598F7
  );

  background-size: 500% 500%;
  animation: blueFlow 22s ease-in-out infinite;
}

@keyframes blueFlow {
  0% {
    background-position: 0% 50%;
  }

  25% {
    background-position: 50% 100%;
  }

  50% {
    background-position: 100% 50%;
  }

  75% {
    background-position: 50% 0%;
  }

  100% {
    background-position: 0% 50%;
  }
}
