import { Slide, ToastOptions } from 'react-toastify';

export const toastConfig: ToastOptions = {
  position: 'bottom-right',
  hideProgressBar: true,
  closeButton: false,
  autoClose: 1500,
  icon: false,
  transition: Slide,
  style: {
    width: '100%',
    textAlign: 'center',
    fontSize: '0.65em',
    fontFamily: 'PressStart',
  },
};
