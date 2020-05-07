import React, { Component } from 'react';
import ScrollMenu from 'react-horizontal-scrolling-menu';
import './menu.css';

// list of items
const list = [
	{ name: 'Filtro 1' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 2' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 3' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 4' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 5' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 6' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 7' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 8' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 9' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 10' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 11' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 12' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 13' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 14' , contenido: 'Texto para el primer filtro'},
	{ name: 'Filtro 15' , contenido: 'Texto para el primer filtro'}
];

// One item component
// selected prop will be passed
const MenuItem = ({ text, selected, contenido }) => {
return <div className={`menu-item ${selected ? 'active' : ''}`}>{text}</div>;
	
};

// All items component
// Important! add unique key
export const Menu = (list, selected) =>
	list.map((el) => {
		const { name } = el;
		const {contenido} = el;
		//console.log('Imprimiendo la const name...', contenido)
		return <MenuItem text={name} key={name} selected={selected} />;
	});

const Arrow = ({ text, className }) => {
	return <div className={className}>{text}</div>;
};

const ArrowLeft = Arrow({ text: '<', className: 'arrow-prev' });
const ArrowRight = Arrow({ text: '>', className: 'arrow-next' });

const selected = 'Filtro1';

class Componente_Menu extends Component {
	constructor(props) {
		super(props);
		// call it again if items count changes
		this.menuItems = Menu(list, selected);
	}

	state = {
		selected
	};

	onSelect = (key) => {
		this.setState({ selected: key });
	};

	render() {
		const { selected } = this.state;
		// Create menu from items
		const menu = this.menuItems;

		return (
			<div>
				<ScrollMenu
					data={menu}
					arrowLeft={ArrowLeft}
					arrowRight={ArrowRight}
					selected={selected}
					onSelect={this.onSelect}
					wheel={true}
				/>
			</div>
		);
	}
}
export default Componente_Menu;
