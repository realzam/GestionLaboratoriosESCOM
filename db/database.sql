
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
  PRIMARY KEY(idComputadoraidLaboratorio,),
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


CREATE TABLE Hora (
  idHora INT NOT NULL,
  inicio time,
  fin time,
  PRIMARY KEY(idHora)
);

CREATE TABLE Dia(
  idDia INT NOT NULL,
  dia VARCHAR(10),
  PRIMARY KEY(idDia)
);

CREATE TABLE Horario(
  idHorario INT NOT NULL,
  clase VARCHAR(30),
  hora int,
  dia int,
  foreign key(hora) references Hora(idHora)
  on delete cascade on update cascade,
  foreign key(dia) references Dia(idDia)
  on delete cascade on update cascade,
  PRIMARY KEY(idHorario,clase,hora,dia)
);



