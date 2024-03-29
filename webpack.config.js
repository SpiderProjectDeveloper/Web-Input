// webpack.config.js
// var BomPlugin = require('webpack-utf8-bom');
const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000,
		setup(app) {
			app.get('/.input_data', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/input_data.json'));
			});
/*
			app.post('/.save_input', (req, res) => {
				res.send( JSON.stringify({ 
					errcode:0, 
					array: [ { Code:"1", DurDone: 290, DurRest: 120, Fin: 1523742400, Start: 1521197200, TeamDur: 400,
						VolDone: 10, VolPlan: 80, VolRest: 10 } ] 
					}) 
				);
			});
*/
			app.post('/.save_input', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/save_input.json'));
			});
			app.post('/.close_project', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/close_project.json'));
			});
			app.get('/project_closed.html', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/project_closed.html'));
			});
			//app.get('/bundle.js', (req, res) => {
			//	  res.sendFile(path.resolve(__dirname, 'dist/bundle.js'));
			//});
		}
  },
  entry: [
    './src/index.js',
  ],
  optimization: {
    minimize: true,
  },
  output: {
	path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
			{
				loader: 'style-loader',
			}, 
			{
				loader: 'css-loader',
			}
        ]
      },
      {
        test: /\.html$/,
        loader: "html-loader",
		options: {
			attributes: false,
		},
      }
    ]
  }
};