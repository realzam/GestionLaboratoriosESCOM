
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
  estado VARCHAR(45) NOT NULL,
  PRIMARY KEY(idLaboratorio)
);

CREATE TABLE Computadora (
  idComputadora INT NOT NULL,
  idLaboratorio INT NOT NULL,
  estado VARCHAR(45) NOT NULL,
  foreign key(idLaboratorio) references Laboratorio(idLaboratorio)
  on delete cascade on update cascade,
  PRIMARY KEY(idComputadora,idLaboratorio)
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
  idHorario int,
  clase VARCHAR(30),
  hora int,
  dia int,
  foreign key(idHorario) references Laboratorio(idLaboratorio)
  on delete cascade on update cascade,
  foreign key(hora) references Hora(idHora)
  on delete cascade on update cascade,
  foreign key(dia) references Dia(idDia)
  on delete cascade on update cascade,
  PRIMARY KEY(idHorario,clase,hora,dia)
);


CREATE TABLE ReservaComputadora (
  idUsuario INT NOT NULL,
  idComputadora INT NOT NULL,
  idLaboratorio INT NOT NULL,
  inicio DATETIME,
  dia int,
  hora int,
  fin DATETIME,
  estado VARCHAR(60) ,
  foreign key(idUsuario) references Usuario(id)
  on delete cascade on update cascade,
  foreign key(idComputadora) references Computadora(idComputadora)
  on delete cascade on update cascade,
  foreign key(idLaboratorio) references Laboratorio(idLaboratorio)
  on delete cascade on update cascade,
  foreign key(dia) references Dia(idDia)
  on delete cascade on update cascade,
  foreign key(hora) references Hora(idHora)
  on delete cascade on update cascade,
   PRIMARY KEY(idUsuario,idComputadora,idLaboratorio,inicio)
);

insert into Dia() values(1,'lunes');
insert into Dia() values(2,'martes');
insert into Dia() values(3,'miercoles');
insert into Dia() values(4,'jueves');
insert into Dia() values(5,'viernes');

insert into Hora() values(1,'07:00','08:29:59');
insert into Hora() values(2,'08:30','9:59:59');
insert into Hora() values(3,'10:00','10:29:59');
insert into Hora() values(4,'10:30','11:59:59');
insert into Hora() values(5,'12:00','13:29:59');
insert into Hora() values(6,'13:30','14:59:59');
insert into Hora() values(7,'15:00','16:29:59');
insert into Hora() values(8,'16:30','11:59:59');
insert into Hora() values(9,'18:00','18:29:59');
insert into Hora() values(10,'18:30','19:59:59');
insert into Hora() values(11,'20:00','21:29:59');


insert into Laboratorio() values(1105,'');
insert into Laboratorio() values(1106,'');
insert into Laboratorio() values(1107,'');
insert into Laboratorio() values(2103,'');




