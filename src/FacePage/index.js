import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import mapStateToProps from './mapStateToProps';
import mapDispatchToProps from './mapDispatchToProps';
import Camera from './Camera';
import Canva from './Canva';
import * as faceapi from 'face-api.js';

import MenuFiltros from '../components/MenuFiltros';
import filtros from './filtrosConfig';

class FacePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			controller: 'game',
			loading: false,
			authorized: false,
			checkAutorization: true,
			positionIndex: 0,
			imageFilter: new Image(),
			imagenMari: new Image(),
			filterSelected: 'Cocina4'
		};
		this.setVideoHandler = this.setVideoHandler.bind(this);
		this.isModelLoaded = this.isModelLoaded.bind(this);
		this.onSelectFilter = this.onSelectFilter.bind(this);
		this.addFilter = this.addFilter.bind(this);
	}

	translateExpression(expression) {
		switch (expression) {
			case 'neutral':
				return 'Neutra';
			case 'happy':
				return 'Alegría';
			case 'sad':
				return 'Tristeza';
			case 'angry':
				return 'Enojo';
			case 'surprised':
				return 'Sorpresa';
			case 'disgusted':
				return 'Disgusto';
			case 'fearful':
				return 'Temor';
			default:
				return 'Desconocida';
		}
	}

	getExpression(expressions) {
		const _keys = Object.keys(expressions),
			_values = Object.values(expressions);
		const maxValue = Math.max(..._values);
		const expression = _keys[_values.indexOf(maxValue)];

		return [ this.translateExpression(expression), maxValue * 100 ];
	}

	identifyPoints(canvas, points, color) {
		canvas.beginPath();
		canvas.strokeStyle = color;
		//const totalPoints = points.length / 2 + 1;

		for (let i = 3; i < 5; i++) {
			// si el índice es 0 me muevo a la coordenada
			if (i === 0) canvas.moveTo(points[i].x, points[i].y);
			else
				// de lo contrario se fija una línea para la coordenada
				canvas.lineTo(points[i].x, points[i].y);
		}
		canvas.stroke();
		canvas.closePath();
	}

	//Obtener las imagenes
	getFaceImageUri(className, idx) {
		return `${className}/${className}${idx}.svg`;
	}

	async cargarImagenes(imagencargada = 1) {
		const classes = [ 'Cocina' ];

		const cargaImagen = await Promise.all(
			classes.map(async (className) => {
				for (let i = 1; i < imagencargada + 1; i++) {
					let img = new Image();
					img.src = '/Imagenes/Cocina' + this.getFaceImageUri(className, i);
					//console.log(img);
				}

				return new cargaImagen();
			})
		);

		return new this.cargarImagenes();
	}

	getRotation(position) {
		const m = (position.Y2 - position.Y1) / (position.X2 - position.X1) * 100;

		// m = (positionY2 - positionY1) / (positionX2 - positionX1) * 100;
		const TO_RADIANS = Math.PI / 180;

		return m / 2.5 * TO_RADIANS;
	}

	addFilter(canvas, landmarks) {
		let startIndex = 0, // eyeLeft
			endIndex = 16, // eyeRight
			ajustX = 0,
			ajustY = 20;

		const filtro = filtros.find((f) => f.name === this.state.filterSelected);
		const angleInRad = this.getRotation({
			X1: landmarks.positions[startIndex].x - ajustX,
			Y1: landmarks.positions[startIndex].y + ajustY,
			X2: landmarks.positions[endIndex].x + ajustX,
			Y2: landmarks.positions[endIndex].y + ajustY
		});

		const initialPosition = {
			x: landmarks[filtro.positionFace]()[0].x + filtro.move.toRight,
			y: landmarks[filtro.positionFace]()[0].y + filtro.move.toBottom
		};

		canvas.translate(initialPosition.x, initialPosition.y);

		canvas.rotate(angleInRad);

		canvas.drawImage(this.state.imageFilter, 0, 0, filtro.dim.width, filtro.dim.height);
	}

	async setVideoHandler() {
		if (this.isModelLoaded() !== undefined) {
			try {
				let detections = await faceapi
					.detectAllFaces(this.props.video.current, this.props.detector_options)
					.withFaceLandmarks()
					.withFaceExpressions()
					.withAgeAndGender();

				if (detections !== undefined) {
					const dims = faceapi.matchDimensions(this.props.canvas.current, this.props.video.current, true);
					const resizedResult = faceapi.resizeResults(detections, dims);

					// faceapi.draw.drawDetections(this.props.canvas.current, resizedResult);

					detections.forEach((result) => {
						const { age, gender, genderProbability, expressions, landmarks } = result;
						const genderTraduced = gender === 'male' ? 'Hombre' : 'Mujer';
						const genderProbabilityRounded = genderProbability * 100;
						const [ expression, estimation ] = this.getExpression(expressions);

						new faceapi.draw.DrawTextField(
							[
								`Edad: ${faceapi.utils.round(age, 0)}`,
								`Sexo: ${genderTraduced} (${genderProbabilityRounded.toFixed()}%)`,
								`Expresión: ${expression} (${estimation.toFixed()}%)`
							],
							result.detection.box.bottomLeft
						).draw(this.props.canvas.current);

						//ADD CANVAS
						const currentCanvas = ReactDOM.findDOMNode(this.props.canvas.current);
						var canvasElement = currentCanvas.getContext('2d');

						this.addFilter(canvasElement, landmarks);
					});
				}
			} catch (exception) {
				console.log(exception);
			}
		}
		setTimeout(() => this.setVideoHandler());
	}

	isModelLoaded() {
		if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) {
			return faceapi.nets.ssdMobilenetv1.params;
		}
		if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) {
			return faceapi.nets.tinyFaceDetector.params;
		}
	}

	async componentDidMount() {
		console.log('height: ' + window.screen.height + ', width: ' + window.screen.width);

		this.setDetectorOptions();
		this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);

		let modelFolder = '/models';
		try {
			await faceapi.loadFaceLandmarkModel(modelFolder);
			await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
			await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);
			await faceapi.nets.faceRecognitionNet.loadFromUri(modelFolder);

			if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) {
				await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
			}

			if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) {
				await faceapi.nets.tinyFaceDetector.load(modelFolder);
			}

			// this.state.imagenMari.onload = function() {
			// 	console.log('imagen de mariposa is loaded');
			// };
		} catch (exception) {
			console.error('ComponentDidMount exception', exception);
		}
	}

	setDetectorOptions() {
		let minConfidence = this.props.min_confidence,
			inputSize = this.props.input_size,
			scoreThreshold = this.props.score_threshold;

		let options =
			this.props.selected_face_detector === this.props.SSD_MOBILENETV1
				? new faceapi.SsdMobilenetv1Options({
						minConfidence
					})
				: new faceapi.TinyFaceDetectorOptions({
						inputSize,
						scoreThreshold
					});
		this.props.SET_DETECTOR_OPTIONS_IN_GAME_FACENET(options);
	}

	onSelectFilter(name) {
		const filtro = filtros.find((f) => f.name === name);
		const image = this.state.imageFilter;
		image.src = filtro.path;

		this.setState({ filterSelected: name, imageFilter: image });
	}

	render() {
		return (
			<div>
				<MenuFiltros
					filters={filtros}
					handleSelectFilter={this.onSelectFilter}
					selected={this.state.filterSelected}
				/>
				<Camera />
				<Canva />

				{''}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FacePage);
