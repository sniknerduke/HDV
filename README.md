
  ## Running the code

  Run `npm i` to install the dependencies.
  Run `npm run dev` to start the development server.

  Just in case u got the error missing modules or ps execution policy is fucked up run : <br>
  
  
  Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser ( in ps with ad perm) <br>
  Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json; npm install ( remove and reinstall the npm modules that available in this shitty project :v then everything should be worked out i think )
  
