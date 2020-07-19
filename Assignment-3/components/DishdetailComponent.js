import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { DISHES } from '../shared/dishes';
import { COMMENTS } from '../shared/comments';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { Picker, Switch, Button, TouchableHighlight, Modal } from 'react-native';
import { Rating, AirbnbRating, Input} from 'react-native-elements';
import {useState }from "react";
import * as Animatable from 'react-native-animatable';
import { Alert, PanResponder } from 'react-native';




const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId))
})



function RenderComments(props) {

    const comments = props.comments;

    
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
      <Animatable.View animation="fadeInUp" duration={2000} delay={1000}> 
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
        </Animatable.View>
    );
}

class RenderDish extends Component {
    

    constructor(props) {
        super(props);
        this.state = {
            dish: props.dish,
            modalVisible: false,
            rating: 0,
            author: 'Guest',
            comment: 'default comment'

        };
    }

    handleComment() {
      console.log(JSON.stringify(this.state));

  }

  handleViewRef = ref => this.view = ref;
 
    render(){

      const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    //Left to right drag

    const recognizeDragB = ({ moveX, moveY, dx, dy }) => {
      if ( dx > 200 )
          return true;
      else
          return false;
  }


    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState)){
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + this.props.dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {this.props.favorite ? console.log('Already favorite') : this.props.onPress()}},
                    ],
                    { cancelable: false }
                );}
                else if (recognizeDragB(gestureState)){
                  this.setState({modalVisible:true});

                }

            return true;
        }
    })




    
        if (this.props.dish != null) {
            return(
               
              <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
              ref={this.handleViewRef}
              {...panResponder.panHandlers}>
                <View>
                <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.modalVisible}

              >
                <View>
                  <View>

                    <Rating
                    showRating
                    onFinishRating={this.ratingCompleted}
                    selectedValue={this.state.rating}
                    onValueChange={(ratingValue) => this.setState({rating: ratingValue})}
                    style={{ paddingVertical: 10 }}
                    />
                    
                    <Input
  placeholder='Author'
  value={this.state.author}
  onValueChange={(value) => this.setState({author: value})}
  leftIcon={
    <Icon
      name='user-circle'
      size={24}
      color='black'
      type='font-awesome'
    />
  }
/>

<Input
  placeholder='Comment'
  value={this.state.comment}
  onValueChange={(value) => this.setState({comment: value})}
  leftIcon={
    <Icon
      name='comment'
      size={24}
      color='black'
      type='font-awesome'
    />
  }
/>

                    <Button onPress={() => this.handleReservation()} title="Submit" />

                     <Text> </Text>
                 
                      <Button color="#ff5c5c" onPress={() => {
                        this.setState({modalVisible:!this.state.modalVisible});
                      }}  title="Cancel" />
                   
                  </View>
                </View>
              </Modal>
              <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
            <Card
            featuredTitle={this.props.dish.name}
                image={{uri: baseUrl + this.props.dish.image}}>
                    <Text>
                        {this.props.dish.description}
                    </Text>
                    <Icon
                        raised
                        reverse
                        name={ this.props.favorite ? 'heart' : 'heart-o'}
                        type='font-awesome'
                        color='#f50'
                        onPress={() => this.props.favorite ? console.log('Already favorite') : this.props.onPress()}
                        />
                        <Icon
                        raised
                        reverse
                        name='pencil'
                        type='font-awesome'
                        color='#f20'
                        onPress={() => {
                            this.setState({modalVisible:true});
                          }}                  
                        />
                </Card>
                </Animatable.View>
                </View>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}
}

class Dishdetail extends Component {


    constructor(props) {
        super(props);
        this.state = {
            dishes: DISHES,
            comments: COMMENTS,
            favorites: []
            
        };
    }



   
    static navigationOptions = {
        title: 'Dish Details'
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    
    

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                   favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: "white",
      padding: 20,
      margin: 10,
    }
  });
  

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);