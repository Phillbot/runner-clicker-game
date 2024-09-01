import { Slide, ToastOptions } from 'react-toastify';

export const toastConfig: ToastOptions = {
  position: 'top-right',
  hideProgressBar: true,
  closeButton: false,
  autoClose: 1000,
  icon: false,
  transition: Slide,
  style: {
    width: '100%',
    textAlign: 'center',
    fontSize: '0.65em',
    fontFamily: 'PressStart',
  },
};
