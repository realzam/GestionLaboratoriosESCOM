
CREATE TABLE Usuario (
  id INT NOT NULL,
  nombre VARCHAR(60) ,
  apellido VARCHAR(60) ,
  correo VARCHAR(60) NOT NULL,
  tiposuario TinyInt NOT NULL,
  password VARCHAR(45) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE Laboratorio (
  idLaboratorio INT NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY(idLaboratorio)
);

CREATE TABLE Computadora (
  idComputadora INT NOT NULL,
  idLaboratorio INT NOT NULL,
  PRIMARY KEY(idComputadora),
  foreign key(idLaboratorio) references Laboratorio(idLaboratorio)
  on delete cascade on update cascade
);

CREATE TABLE reservaComputadora (
  idReservaComputadora INT NOT NULL,
  idUsuario INT NOT NULL,
  idComputadora INT NOT NULL,
  estado VARCHAR(60) ,
  PRIMARY KEY(idReservaComputadora),
  foreign key(idUsuario) references Usuario(id)
  on delete cascade on update cascade,
  foreign key(idComputadora) references Computadora(idComputadora)
  on delete cascade on update cascade
);
