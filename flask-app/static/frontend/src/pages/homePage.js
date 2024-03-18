
import CreateBtn from '../components/createBtn';
import Login from '../components/login';
import Logo from '../components/logo';
import './homePage.css'
//import RedBalloon from './components/redBalloon';
//import OrangeBalloon from './components/orangeBalloon';

function HomePage() {
  return (
    <div className="Home-Page">
      <Logo />
      <CreateBtn />
      <Login />
      {/* <RedBalloon /> */}
      {/* <OrangeBalloon /> */}
    </div>
  );
}

export default HomePage;
