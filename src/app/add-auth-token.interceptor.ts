import { HttpInterceptorFn } from "@angular/common/http";

export const addAuthTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = sessionStorage.getItem("authToken");
  if (authToken) {
    // Clone the request and add the Authorization header
    const request = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${authToken}`),
    });
    return next(request);
  }

  // If there is no authToken, just return the request as is, the API will produce an error with a meaningful message
  return next(req);
};
