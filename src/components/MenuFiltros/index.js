import React, { Component } from 'react';
import ScrollMenu from 'react-horizontal-scrolling-menu';

import './style.css';

const Filtro = ({ path, selected }) => {
	return <img src={path} className={`menu-item ${selected ? 'active' : ''}`} alt="Cocina" height="67" width="80" />;
};

export const Menu = (list, selected) =>
	list.map((el) => {
		const { name, path } = el;

		return <Filtro path={path} key={name} selected={selected} />;
	});

const Arrow = ({ text, className }) => {
	return <div className={className}>{text}</div>;
};

const ArrowLeft = Arrow({ text: '<', className: 'arrow-prev' });
const ArrowRight = Arrow({ text: '>', className: 'arrow-next' });

class MenuFiltros extends Component {
	constructor(props) {
		super(props);

		this.menuItems = Menu(props.filters, props.selected);
	}

	onSelect = (key) => {
		this.props.handleSelectFilter(key);
	};

	render() {
		const { selected } = this.props;
		// Create menu from items
		const menu = this.menuItems;

		return (
			<div>
				<div className="App">
					<ScrollMenu
						data={menu}
						arrowLeft={ArrowLeft}
						arrowRight={ArrowRight}
						selected={selected}
						onSelect={this.onSelect}
					/>
				</div>
			</div>
		);
	}
}

export default MenuFiltros;
